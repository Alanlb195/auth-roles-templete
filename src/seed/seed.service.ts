import { Injectable } from '@nestjs/common';
import { initialData } from './data/seed-data';

import * as bcrypt from "bcryptjs";
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class SeedService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async runSeed() {
        await this.deleteTables();
        await this.insertUsers();
        return 'SEED EXECUTED'
    }

    private async deleteTables() {
        await this.prisma.user.deleteMany();
    }


    private async insertUsers() {

        const seedUsers = initialData.users;

        for (const user of seedUsers) {
            await this.prisma.user.create({
                data: {
                    email: user.email,
                    fullName: user.fullName,
                    password: bcrypt.hashSync(user.password, 10),
                    role: user.roles[0] as any
                },
            });
        }
    }

}
