﻿using ApiServer.Contracts.Candidates;
using Domain.Model.Enum;
using Domain.Services.Contracts.Candidate;
using Domain.Services.Contracts.Consultant;
using Domain.Services.Contracts.Stage;
using System;
using System.Collections.Generic;

namespace Domain.Services.Contracts.Process
{
    public class UpdateProcessContract
    {
        public int Id { get; set; }
        
        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }
        
        public ProcessStatus Status { get; set; }

        public string Profile { get; set; }

        public string RejectionReason { get; set; }

        public int? CandidateId { get; set; }

        public UpdateCandidateContract Candidate { get; set; }

        //public ReadedCandidateContract Candidate { get; set; }

        public int? ConsultantOwnerId { get; set; }
        public UpdateConsultantContract ConsultantOwner { get; set; }

        public int? ConsultantDelegateId { get; set; }
        public UpdateConsultantContract ConsultantDelegate { get; set; }

        public float? ActualSalary { get; set; }
        public float? WantedSalary { get; set; }
        public float? AgreedSalary { get; set; }

        public string EnglishLevel { get; set; }
        public Seniority Seniority { get; set; }
        public DateTime OfferDate { get; set; }
        public DateTime HireDate { get; set; }

        //public List<UpdateStageContract> Stages { get; set; }
        public UpdateHrStageContract HrStage { get; set; }
        public UpdateTechnicalStageContract TechnicalStage { get; set; }
        public UpdateClientStageContract ClientStage { get; set; }
        public UpdateOfferStageContract OfferStage { get; set; }
    }
}
