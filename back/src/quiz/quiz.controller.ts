import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { AuthenticatedRequest } from "../common/types/authenticated-request.type";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { QuizService } from "./quiz.service";

@Controller("quizzes")
@UseGuards(AuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.quizService.list(userId);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.quizService.get(Number(id));
  }

  @Post()
  create(@Body() dto: CreateQuizDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.quizService.create(dto, userId);
  }

  @Patch(":id")
  replace(@Param("id") id: string, @Body() dto: Partial<UpdateQuizDto>) {
    return this.quizService.update(Number(id), dto);
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
