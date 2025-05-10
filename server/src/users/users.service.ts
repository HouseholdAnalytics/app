import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    
    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password_hash: hashedPassword,
    });
    
    await this.usersRepository.save(user);
    
    const { password_hash, ...result } = user;
    return result;
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }
}