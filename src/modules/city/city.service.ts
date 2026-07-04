import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CityService {
    constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    ) {}
}
