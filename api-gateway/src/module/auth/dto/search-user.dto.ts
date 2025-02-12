import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SearchUserDto extends PaginationDto {
  @IsOptional()
  @IsString()
  email?: string;
}
