import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(
      req.user.userId,
      createTransactionDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.transactionsService.findAllByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Request() req, @Param("id") id: string) {
    return this.transactionsService.findOne(req.user.userId, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    return this.transactionsService.update(
      req.user.userId,
      +id,
      updateTransactionDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Request() req, @Param("id") id: string) {
    return this.transactionsService.remove(req.user.userId, +id);
  }
}
