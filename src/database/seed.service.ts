import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';
import { LanguagesService } from '../languages/languages.service';
import { UsersService } from '../users/users.service';
import { RoleType } from '../common/enums';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private rolesService: RolesService,
    private languagesService: LanguagesService,
    private usersService: UsersService,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedLanguages();
    await this.seedAdminUser();
  }

  private async seedRoles() {
    const roles = [
      { name: RoleType.ADMIN, description: 'Administrator with full access' },
      { name: RoleType.AUTHOR, description: 'Content author' },
      { name: RoleType.EDITOR, description: 'Content editor' },
      { name: RoleType.TRANSLATOR, description: 'Content translator' },
    ];

    for (const roleData of roles) {
      const existingRole = await this.rolesService.findByName(roleData.name);
      if (!existingRole) {
        await this.rolesService.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      }
    }
  }

  private async seedLanguages() {
    const languages = [
      { code: 'es', name: 'Español', isDefault: true, isActive: true },
      { code: 'en', name: 'English', isDefault: false, isActive: true },
    ];

    for (const langData of languages) {
      const existingLang = await this.languagesService.findByCode(langData.code);
      if (!existingLang) {
        await this.languagesService.create(langData);
        console.log(`Created language: ${langData.name}`);
      }
    }
  }

  private async seedAdminUser() {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.usersService.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      const adminRole = await this.rolesService.findByName(RoleType.ADMIN);
      
      await this.usersService.create({
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        password: 'admin123', // Change this in production
        roleIds: adminRole ? [adminRole.id] : [],
      });
      
      console.log('Created admin user: admin@example.com / admin123');
    }
  }
}