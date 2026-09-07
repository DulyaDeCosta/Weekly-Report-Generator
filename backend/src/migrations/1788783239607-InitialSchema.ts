import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788783239607 implements MigrationInterface {
    name = 'InitialSchema1788783239607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`email\` varchar(150) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('MEMBER', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'MEMBER', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`projects\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_2187088ab5ef2a918473cb9900\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blockers\` (\`id\` varchar(36) NOT NULL, \`reportId\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`isKey\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`achievements\` (\`id\` varchar(36) NOT NULL, \`reportId\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`isKey\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`review_actions\` (\`id\` varchar(36) NOT NULL, \`reportId\` varchar(255) NOT NULL, \`reviewerId\` varchar(255) NOT NULL, \`actionType\` enum ('APPROVED', 'REQUESTED_CHANGES') NOT NULL, \`comment\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reports\` (\`id\` varchar(36) NOT NULL, \`authorId\` varchar(255) NOT NULL, \`projectId\` varchar(255) NOT NULL, \`weekStartDate\` date NOT NULL, \`weekEndDate\` date NOT NULL, \`status\` enum ('DRAFT', 'SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED') NOT NULL DEFAULT 'DRAFT', \`tasksPlannedNextWeek\` text NULL, \`notes\` text NULL, \`hoursDevelopment\` int NOT NULL DEFAULT '0', \`hoursTesting\` int NOT NULL DEFAULT '0', \`hoursMeetings\` int NOT NULL DEFAULT '0', \`hoursDocumentation\` int NOT NULL DEFAULT '0', \`latestReviewComment\` text NULL, \`submittedAt\` timestamp NULL, \`reviewedAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`UQ_report_author_week\` (\`authorId\`, \`weekStartDate\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tasks\` (\`id\` varchar(36) NOT NULL, \`reportId\` varchar(255) NOT NULL, \`name\` varchar(200) NOT NULL, \`priority\` enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM', \`status\` enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED') NOT NULL DEFAULT 'NOT_STARTED', \`plannedPercentage\` int NOT NULL DEFAULT '0', \`actualPercentage\` int NOT NULL DEFAULT '0', \`timePlannedHours\` int NOT NULL DEFAULT '0', \`timeSpentHours\` int NOT NULL DEFAULT '0', \`deliverable\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`blockers\` ADD CONSTRAINT \`FK_73d094e0d437e3c2668e660929b\` FOREIGN KEY (\`reportId\`) REFERENCES \`reports\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`achievements\` ADD CONSTRAINT \`FK_e6be7ccd13384d00e52c267863a\` FOREIGN KEY (\`reportId\`) REFERENCES \`reports\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review_actions\` ADD CONSTRAINT \`FK_6771676d8fdc1ef970accb65c4f\` FOREIGN KEY (\`reportId\`) REFERENCES \`reports\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review_actions\` ADD CONSTRAINT \`FK_2915c698e2855548fa7011d9524\` FOREIGN KEY (\`reviewerId\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_80aefe60537fc97e08862f6a489\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_b123aed1a96e282b13ac2abcb31\` FOREIGN KEY (\`projectId\`) REFERENCES \`projects\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tasks\` ADD CONSTRAINT \`FK_8e1144c00f62c87bb24caa099c7\` FOREIGN KEY (\`reportId\`) REFERENCES \`reports\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP FOREIGN KEY \`FK_8e1144c00f62c87bb24caa099c7\``);
        await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_b123aed1a96e282b13ac2abcb31\``);
        await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_80aefe60537fc97e08862f6a489\``);
        await queryRunner.query(`ALTER TABLE \`review_actions\` DROP FOREIGN KEY \`FK_2915c698e2855548fa7011d9524\``);
        await queryRunner.query(`ALTER TABLE \`review_actions\` DROP FOREIGN KEY \`FK_6771676d8fdc1ef970accb65c4f\``);
        await queryRunner.query(`ALTER TABLE \`achievements\` DROP FOREIGN KEY \`FK_e6be7ccd13384d00e52c267863a\``);
        await queryRunner.query(`ALTER TABLE \`blockers\` DROP FOREIGN KEY \`FK_73d094e0d437e3c2668e660929b\``);
        await queryRunner.query(`DROP TABLE \`tasks\``);
        await queryRunner.query(`DROP INDEX \`UQ_report_author_week\` ON \`reports\``);
        await queryRunner.query(`DROP TABLE \`reports\``);
        await queryRunner.query(`DROP TABLE \`review_actions\``);
        await queryRunner.query(`DROP TABLE \`achievements\``);
        await queryRunner.query(`DROP TABLE \`blockers\``);
        await queryRunner.query(`DROP INDEX \`IDX_2187088ab5ef2a918473cb9900\` ON \`projects\``);
        await queryRunner.query(`DROP TABLE \`projects\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
