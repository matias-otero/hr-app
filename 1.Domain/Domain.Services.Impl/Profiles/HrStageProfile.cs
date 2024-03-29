﻿using System;
using ApiServer.Contracts.Stage;
using AutoMapper;
using Domain.Model;
using Domain.Model.Enum;
using Domain.Services.Contracts.Stage;

namespace Domain.Services.Impl.Profiles
{
    public class HrStageProfile : StageProfile
    {
        public HrStageProfile()
        {

            CreateMap<HrStage, ReadedHrStageContract>()
                .IncludeBase<Stage, ReadedStageContract>();
                //.ForMember(dest => dest.StageItems, opt => opt.MapFrom(src => src.StageItems));

            CreateMap<CreateHrStageContract, HrStage>()
                .ForMember(destination => destination.Status,
                opt => opt.MapFrom(source => Enum.GetName(typeof(StageStatus), source.Status)))
                .ForMember(destination => destination.EnglishLevel,
                opt => opt.MapFrom(source => Enum.GetName(typeof(EnglishLevel), source.EnglishLevel)));
            CreateMap<HrStage, CreatedHrStageContract>();
            CreateMap<UpdateHrStageContract, HrStage>()
                            .ForMember(destination => destination.Status,
                opt => opt.MapFrom(source => Enum.GetName(typeof(StageStatus), source.Status)))
                .ForMember(destination => destination.EnglishLevel,
                opt => opt.MapFrom(source => Enum.GetName(typeof(EnglishLevel), source.EnglishLevel)));
            CreateMap<UpdateHrStageViewModel, UpdateHrStageContract>();
        }
    }
}
