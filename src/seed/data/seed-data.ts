interface SeedUser {
    email: string,
    fullName: string,
    password: string,
    roles: string[],
    active: boolean,
}


interface SeedData {
    users: SeedUser[];
}


export const initialData: SeedData = {

    users: [
        {
            email: 'test1@gmail.com',
            fullName: 'Admin',
            password: 'Abc123',
            roles: ['ADMIN'],
            active: true,
        },
        {
            email: 'test2@gmail.com',
            fullName: 'User',
            password: 'Abc123',
            roles: ['USER'],
            active: true,
        },
    ],

}