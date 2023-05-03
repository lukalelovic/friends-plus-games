const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { AppController } = require('./controller');
const { AppService } = require('./service');
const { User } = require('./user.entity');

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "mariadb",
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: true,
            entities: [User],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}