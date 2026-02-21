import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { QuizService } from "./quiz.service";

@Controller("quizzes")
@UseGuards(AuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  list() {
    return this.quizService.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.quizService.get(Number(id));
  }

  @Post()
  create(@Body() dto: CreateQuizDto) {
    return this.quizService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateQuizDto) {
    return this.quizService.update(Number(id), dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.quizService.remove(Number(id));
  }
}
