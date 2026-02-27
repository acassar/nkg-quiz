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
import { QuestionService } from "./question.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";

@Controller("questions")
@UseGuards(AuthGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get(":id")
  get(@Param("id") id: string) {
    return this.questionService.get(Number(id));
  }

  @Post("category/:categoryId")
  create(
    @Param("categoryId") categoryId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionService.create(Number(categoryId), dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionService.update(Number(id), dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.questionService.remove(Number(id));
  }
}
