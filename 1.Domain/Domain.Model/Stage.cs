﻿using Core;
using Domain.Model.Enum;
using System;
using System.Collections.Generic;

namespace Domain.Model
{
    public abstract class Stage : Entity<int>
    {
        public StageType Type { get; set; }

        public DateTime? Date { get; set; }

        public string Feedback { get; set; }

        public StageStatus Status { get; set; }

        public int ProcessId { get; set; }
        public Process Process { get; set; }

        public int? ConsultantOwnerId { get; set; }
        public Consultant ConsultantOwner { get; set; }

        public int? ConsultantDelegateId { get; set; }
        public Consultant ConsultantDelegate { get; set; }

        public string RejectionReason { get; set; }
    }
}