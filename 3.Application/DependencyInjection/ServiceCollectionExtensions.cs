﻿using AutoMapper;
using Core;
using Core.Persistance;
using DependencyInjection.Config;
using Domain.Model;
using Domain.Model.Seed;
using Domain.Services.Contracts.Process;
using Domain.Services.Contracts.Stage;
using Domain.Services.Contracts.Stage.StageItem;
using Domain.Services.ExternalServices;
using Domain.Services.Impl.Services;
using Domain.Services.Impl.Validators.Candidate;
using Domain.Services.Impl.Validators.Consultant;
using Domain.Services.Impl.Validators.HireProjection;
using Domain.Services.Impl.Validators.Seed;
using Domain.Services.Impl.Validators.Skill;
using Domain.Services.Impl.Validators.SkillType;
using Domain.Services.Impl.Validators.Stage;
using Domain.Services.Impl.Validators.Task;
using Domain.Services.Impl.Validators.Community;
using Domain.Services.Impl.Validators.CandidateProfile;
using Domain.Services.Impl.Validators.Reservation;
using Domain.Services.Impl.Validators.Room;
using Domain.Services.Impl.Validators.Office;
using Domain.Services.Interfaces.Repositories;
using Domain.Services.Interfaces.Services;
using Domain.Services.Repositories.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Persistance.EF;
using Domain.Services.Impl.Validators.EmployeeCasualty;
using Domain.Services.Impl.Validators.Employee;
using Domain.Services.Impl.Validators.DaysOff;
using Domain.Services.Impl.Validators.Role;
using Domain.Services.Impl.Validators.CompanyCalendar;

namespace DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddDomain(this IServiceCollection services, DatabaseConfigurations dbConfigs)
        {
            AddUnitOfWork(services, dbConfigs);
            AddExternalServices(services);
            AddServices(services);

            services.AddAutoMapper();

            return services;
        }

        private static void AddServices(IServiceCollection services)
        {
            services.AddScoped<CreateDummyContractValidator, CreateDummyContractValidator>();
            services.AddScoped<UpdateDummyContractValidator, UpdateDummyContractValidator>();
            services.AddScoped<CreateCandidateContractValidator, CreateCandidateContractValidator>();
            services.AddScoped<UpdateCandidateContractValidator, UpdateCandidateContractValidator>();
            services.AddScoped<CreateSkillContractValidator, CreateSkillContractValidator>();
            services.AddScoped<UpdateSkillContractValidator, UpdateSkillContractValidator>();
            services.AddScoped<CreateStageContractValidator, CreateStageContractValidator>();
            services.AddScoped<ProcessStatusContractValidator, ProcessStatusContractValidator>();
            services.AddScoped<UpdateStageContractValidator, UpdateStageContractValidator>();
            services.AddScoped<CreatedStageItemContract, CreatedStageItemContract>();
            services.AddScoped<ReadedProcessContract, ReadedProcessContract>();;
            services.AddScoped<CreateConsultantContractValidator, CreateConsultantContractValidator>();
            services.AddScoped<UpdateConsultantContractValidator, UpdateConsultantContractValidator>();
            services.AddScoped<CreateSkillTypeContractValidator, CreateSkillTypeContractValidator>();
            services.AddScoped<UpdateSkillTypeContractValidator, UpdateSkillTypeContractValidator>();

            services.AddScoped<CreateTaskContractValidator, CreateTaskContractValidator>();
            services.AddScoped<UpdateTaskContractValidator, UpdateTaskContractValidator>();

            services.AddScoped<CreateHireProjectionContractValidator, CreateHireProjectionContractValidator>();
            services.AddScoped<UpdateHireProjectionContractValidator, UpdateHireProjectionContractValidator>();
            services.AddScoped<CreateEmployeeCasualtyContractValidator, CreateEmployeeCasualtyContractValidator>();
            services.AddScoped<UpdateEmployeeCasualtyContractValidator, UpdateEmployeeCasualtyContractValidator>();

            services.AddScoped<CreateCandidateProfileContractValidator, CreateCandidateProfileContractValidator>();
            services.AddScoped<UpdateCandidateProfileContractValidator, UpdateCandidateProfileContractValidator>();
            services.AddScoped<CreateCommunityContractValidator, CreateCommunityContractValidator>();
            services.AddScoped<UpdateCommunityContractValidator, UpdateCommunityContractValidator>();
            services.AddScoped<CreateEmployeeContractValidator, CreateEmployeeContractValidator>();
            services.AddScoped<UpdateEmployeeContractValidator, UpdateEmployeeContractValidator>();
            services.AddScoped<CreateDaysOffContractValidator, CreateDaysOffContractValidator>();
            services.AddScoped<UpdateDaysOffContractValidator, UpdateDaysOffContractValidator>();
            services.AddScoped<CreateCompanyCalendarContractValidator, CreateCompanyCalendarContractValidator>();
            services.AddScoped<UpdateCompanyCalendarContractValidator, UpdateCompanyCalendarContractValidator>();

            services.AddScoped<CreateOfficeContractValidator, CreateOfficeContractValidator>();
            services.AddScoped<UpdateOfficeContractValidator, UpdateOfficeContractValidator>();
            services.AddScoped<CreateRoomContractValidator, CreateRoomContractValidator>();
            services.AddScoped<UpdateRoomContractValidator, UpdateRoomContractValidator>();
            services.AddScoped<CreateReservationContractValidator, CreateReservationContractValidator>();
            services.AddScoped<UpdateReservationContractValidator, UpdateReservationContractValidator>();
            services.AddScoped<CreateRoleContractValidator, CreateRoleContractValidator>();
            services.AddScoped<UpdateRoleContractValidator, UpdateRoleContractValidator>();

            services.AddTransient<IDummyService, DummyService>();
            services.AddTransient<ISkillService, SkillService>();
            services.AddTransient<ICandidateService, CandidateService>();
            services.AddTransient<IProcessStageService, ProcessStageService>();
            services.AddTransient<IProcessService, ProcessService>();
            services.AddTransient<IConsultantService, ConsultantService>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<ISkillTypeService, SkillTypeService>();
            services.AddTransient<ITaskService, TaskService>();
            services.AddTransient<ICommunityService, CommunityService>();
            services.AddTransient<ICandidateProfileService, CandidateProfileService>();
            services.AddTransient<IHireProjectionService, HireProjectionService>();
            services.AddTransient<IEmployeeCasualtyService, EmployeeCasualtyService>();
            services.AddTransient<IReservationService, ReservationService>();
            services.AddTransient<IRoomService, RoomService>();
            services.AddTransient<IOfficeService, OfficeService>();
            services.AddTransient<IEmployeeService, EmployeeService>();
            services.AddTransient<IDaysOffService, DaysOffService>();
            services.AddTransient<IRoleService, RoleService>();
            services.AddTransient<ICompanyCalendarService, CompanyCalendarService>();
            services.AddTransient<IGoogleCalendarService, GoogleCalendarService>();

        }

        private static void AddExternalServices(IServiceCollection services)
        {
            services.AddSingleton<ILoggerFactory, LoggerFactory>();
            services.AddSingleton(typeof(ILogger<>), typeof(Logger<>));
            services.AddSingleton(typeof(ILog<>), typeof(MicrosoftLogger<>));
            services.AddSingleton<IMemCache, MicrosoftMemoryCache>();
            //TODO: Add a config variable and inject a mock AD in case that you're not in the domain.
        }

        private static void AddUnitOfWork(IServiceCollection services, DatabaseConfigurations dbConfigs)
        {
            services.AddDbContext<DataBaseContext>(options =>
            {
                if (dbConfigs.InMemoryMode)
                    options.UseInMemoryDatabase("DBInMemory");
                else
                    options.UseSqlServer(dbConfigs.ConnectionString);

                //Use this to debug client evaluations
                options.ConfigureWarnings(warnings => warnings.Throw(RelationalEventId.QueryClientEvaluationWarning));

            });

            services.AddScoped<IUnitOfWork, UnitOfWork<DataBaseContext>>();
            services.AddScoped<IRepository<Dummy>, DummyRepository>();
            services.AddScoped<IRepository<Candidate>, CandidateRepository>();
            services.AddScoped<IRepository<Stage>, ProcessStageRepository>();
            services.AddScoped<IRepository<HrStage>, HrStageRepository>();
            services.AddScoped<IRepository<TechnicalStage>, TechnicalStageRepository>();
            services.AddScoped<IRepository<ClientStage>, ClientStageRepository>();
            services.AddScoped<IRepository<OfferStage>, OfferStageRepository>();
            services.AddScoped<IRepository<Skill>, SkillRepository>();
            services.AddScoped<IRepository<StageItem>, StageItemRepository>();
            services.AddScoped<IRepository<Process>, ProcessRepository>();
            services.AddScoped<IRepository<Consultant>, ConsultantRepository>();
            services.AddScoped<IRepository<User>, UserRepository>();
            services.AddScoped<IRepository<SkillType>, SkillTypeRepository>();
            services.AddScoped<IRepository<Task>, TaskRepository>();
            services.AddScoped<IRepository<TaskItem>, TaskItemRepository>();
            services.AddScoped<IRepository<HireProjection>, HireProjectionRepository>();
            services.AddScoped<IRepository<EmployeeCasualty>, EmployeeCasualtyRepository>();
            services.AddScoped<IRepository<Reservation>, ReservationRepository>();
            services.AddScoped<IRepository<Room>, RoomRepository>();
            services.AddScoped<IRepository<Office>, OfficeRepository>();
            services.AddScoped<IRepository<Employee>, EmployeeRepository>();
            services.AddScoped<IRepository<DaysOff>, DaysOffRepository>();
            services.AddScoped<IRepository<CompanyCalendar>, CompanyCalendarRepository>();
            services.AddScoped<IRepository<Role>, RoleRepository>();

            services.AddScoped<IStageItemRepository, StageItemRepository>();
            services.AddScoped<IProcessStageRepository, ProcessStageRepository>();
            services.AddScoped<IProcessRepository, ProcessRepository>();
            services.AddScoped<IHrStageRepository, HrStageRepository>();
            services.AddScoped<ITechnicalStageRepository, TechnicalStageRepository>();
            services.AddScoped<IClientStageRepository, ClientStageRepository>();
            services.AddScoped<IOfferStageRepository, OfferStageRepository>();

            services.AddScoped<IRepository<Community>, CommunityRepository>();
            services.AddScoped<IRepository<CandidateProfile>, CandidateProfileRepository>();

            services.AddTransient<IMigrator, SeedMigrator>();
        }
    }
}
