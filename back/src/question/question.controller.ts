import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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

  @Get("category/:categoryId")
  listByCategory(@Param("categoryId") categoryId: string) {
    return this.questionService.listByCategory(Number(categoryId));
  }

  @Post("category/:categoryId")
  create(
    @Param("categoryId") categoryId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionService.create(Number(categoryId), dto);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionService.update(Number(id), dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.questionService.remove(Number(id));
  }
}
