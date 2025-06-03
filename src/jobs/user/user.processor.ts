import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { PrismaService } from "src/prisma/prisma.service";
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs'
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ImportUserDto } from "./dtos/import-user.dto";
import { MailService } from "src/mailer/mailer.service";

@Processor('user')
export class UserProcessor extends WorkerHost {

    private readonly logger = new Logger(UserProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService
    ) {
        super()
    }

    process(job: Job, token?: string): Promise<any> {
        switch (job.name) {
            case 'import-users':
                return this.handleImportUsers(job);
            default:
                this.logger.warn(`Unknown Job: ${job.name}`);
        }
    }


    async handleImportUsers(job: Job) {
        const { file } = job.data;
        const buffer = Buffer.from(file.data);


        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(worksheet);

        let successCount = 0;
        const errors: string[] = [];


        for (const [index, row] of rows.entries()) {

            // Clean data
            const cleanRow = {
                email: (row.email || '').trim(),
                fullName: (row.fullName || '').trim(),
                role: (row.role || '').trim().toUpperCase()
            };

            // Validate con DTO
            const instance = plainToInstance(ImportUserDto, cleanRow);
            const errorsDto = await validate(instance);

            if (errorsDto.length > 0) {
                errors.push(`Fila ${index + 2}: invalid data → ${errorsDto.map(e => Object.values(e.constraints).join(', ')).join(', ')}`);
                continue;
            }

            const exists = await this.prisma.user.findUnique({ where: { email: cleanRow.email } })
            if (exists) {
                errors.push(`Row ${index + 2}: user already exists`);
                continue;
            }

            const { password, rawPassword } = await this.generateSecurePassword();

            const newUser = await this.prisma.user.create({
                data: {
                    ...cleanRow,
                    password,
                    isActive: true
                }
            })

            try {
                await this.mailService.sendUserCreatedByAdminEmail(newUser, rawPassword);
            } catch (err) {
                this.logger.error(`Error sending email to ${newUser.email}: ${err.message}`);
                errors.push(`Row ${index + 2}: user created but email failed to send`);
            }

            successCount++;
        }

        return {
            message: `Created users: ${successCount}`,
            errors,
        };

    }

    async generateSecurePassword() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        const rawPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return {
            rawPassword: rawPassword,
            password: await bcrypt.hashSync(rawPassword, 10)
        }
    }

}
