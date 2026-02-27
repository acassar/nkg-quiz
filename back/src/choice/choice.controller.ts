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
import { ChoiceService } from "./choice.service";
import { CreateChoiceDto } from "./dto/create-choice.dto";
import { UpdateChoiceDto } from "./dto/update-choice.dto";

@Controller("choices")
@UseGuards(AuthGuard)
export class ChoiceController {
  constructor(private readonly choiceService: ChoiceService) {}

  @Get(":id")
  get(@Param("id") id: string) {
    return this.choiceService.get(Number(id));
  }

  @Get("question/:questionId")
  listByQuestion(@Param("questionId") questionId: string) {
    return this.choiceService.listByQuestion(Number(questionId));
  }

  @Post("question/:questionId")
  create(
    @Param("questionId") questionId: string,
    @Body() dto: CreateChoiceDto,
  ) {
    return this.choiceService.create(Number(questionId), dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateChoiceDto) {
    return this.choiceService.update(Number(id), dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.choiceService.remove(Number(id));
  }
}
