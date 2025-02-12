import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/module/common/dto/pagination.dto';

export class SearchUserDto extends PaginationDto {
  @IsOptional()
  @IsString()
  email?: string;
}
