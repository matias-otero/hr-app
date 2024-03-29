import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { Process } from 'src/entities/process';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FacadeService } from 'src/app/services/facade.service';
import { Candidate } from 'src/entities/candidate';
import { Consultant } from 'src/entities/consultant';
import { CandidateDetailsComponent } from 'src/app/candidates/details/candidate-details.component';
import { ConsultantDetailsComponent } from 'src/app/consultants/details/consultant-details.component';
import { AppComponent } from 'src/app/app.component';
import { Stage } from 'src/entities/stage';
import { CandidateAddComponent } from 'src/app/candidates/add/candidate-add.component';
import { HrStageComponent } from 'src/app/stages/hr-stage/hr-stage.component';
import { ClientStageComponent } from 'src/app/stages/client-stage/client-stage.component';
import { OfferStageComponent } from 'src/app/stages/offer-stage/offer-stage.component';
import { HireStageComponent } from 'src/app/stages/hire-stage/hire-stage.component';
import { TechnicalStageComponent } from 'src/app/stages/technical-stage/technical-stage.component';
import { ProcessStatusEnum } from 'src/entities/enums/process-status.enum';
import { SeniorityEnum } from '../../../entities/enums/seniority.enum';
import { Globals } from '../../app-globals/globals';
import { CandidateStatusEnum } from '../../../entities/enums/candidate-status.enum';
import { StageStatusEnum } from '../../../entities/enums/stage-status.enum';
import { HrStage } from 'src/entities/hr-stage';
import { EnglishLevelEnum } from '../../../entities/enums/english-level.enum';
import { Office } from 'src/entities/office';

@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.css'],
  providers: [CandidateDetailsComponent, ConsultantDetailsComponent, AppComponent]
})

export class ProcessesComponent implements OnInit {

  @ViewChild('dropdown') nameDropdown;
  @ViewChild('dropdownStatus') statusDropdown;

  @ViewChild('processCarousel') processCarousel;
  @ViewChild(CandidateAddComponent) candidateAdd: CandidateAddComponent;
  @ViewChild(HrStageComponent) hrStage: HrStageComponent;
  @ViewChild(TechnicalStageComponent) technicalStage: TechnicalStageComponent;
  @ViewChild(ClientStageComponent) clientStage: ClientStageComponent;
  @ViewChild(OfferStageComponent) offerStage: OfferStageComponent;
  @ViewChild(HireStageComponent) hireStage: HireStageComponent;

  filteredProcesses: Process[] = [];

  searchValue = '';
  searchValueStatus = '';
  listOfSearchProcesses = [];
  listOfDisplayData = [...this.filteredProcesses];

  sortName = null;
  sortValue = null;

  processForm: FormGroup;
  rejectProcessForm: FormGroup;
  isDetailsVisible: boolean = false;
  emptyProcess: Process;

  availableCandidates: Candidate[] = [];
  candidatesFullList: Candidate[] = [];
  consultants: Consultant[] = [];

  profileSearch: string = 'ALL';

  profileList: any[];

  statusList: any[];

  emptyCandidate: Candidate;
  emptyConsultant: Consultant;
  currentCandidate: Candidate;

  isEdit: boolean = false;

  currentComponent: string;
  lastComponent: string;
  times: number = 0;

  selectedSeniority: SeniorityEnum;

  offices: Office[] = [];
  stepIndex: number = 0;

  forms: FormGroup[] = [];
  constructor(private facade: FacadeService, private formBuilder: FormBuilder, private app: AppComponent,
    private candidateDetailsModal: CandidateDetailsComponent, private consultantDetailsModal: ConsultantDetailsComponent,
    private globals: Globals) {
      this.profileList = globals.profileList;
      this.statusList = globals.processStatusList;
     }

    

  ngOnInit() {
    this.app.showLoading();
    this.app.removeBgImage();
    this.getProcesses();
    this.getCandidates();
    this.getConsultants();
    this.getOffices();

    this.rejectProcessForm = this.formBuilder.group({
      rejectionReasonDescription: [null, [Validators.required]]
    });

    this.setRejectionReasonValidators();

    this.app.hideLoading();
  }

  setRejectionReasonValidators() {
    // const rejectionReason = this.processForm.get('rejectionReason');

    // this.processForm.get('status').valueChanges
    //   .subscribe(status => {
    //     console.log('setRejectionReasonValidators');
    //     console.log('status: ');
    //     console.log(status);
    //     if (status === '0') {//Rejected 
    //       rejectionReason.setValidators([Validators.required]);
    //     }
    //     else {
    //       rejectionReason.setValidators(null);
    //     }

    //     rejectionReason.updateValueAndValidity();
    //   });
  }

  getCandidates() {
    this.facade.candidateService.get<Candidate>()
      .subscribe(res => {
        this.availableCandidates = res.filter(x => x.status === CandidateStatusEnum.New || x.status === CandidateStatusEnum.Recall);
        this.candidatesFullList = res;
      }, err => {
        console.log(err);
      });
  }

  getConsultants() {
    this.facade.consultantService.get<Consultant>()
      .subscribe(res => {
        this.consultants = res;
      }, err => {
        console.log(err);
      });
  }

  getOffices() {
    this.facade.OfficeService.get<Office>()
      .subscribe(res => {
        this.offices = res;
      }, err => {
        console.log(err);
      });
  }

  getProcesses() {
    this.facade.processService.get<Process>()
      .subscribe(res => {
        this.filteredProcesses = res;
        this.listOfDisplayData = res;

        let newProc: Process = res[res.length - 1];
        if (newProc && newProc.candidate) {
          this.candidatesFullList.push(newProc.candidate);
        }
      }, err => {
        console.log(err);
      });
  }

  getStatus(status: number): string {
    return this.statusList.filter(st => st.id === status)[0].name;
  }

  showApproveProcessConfirm(processID: number): void {
    let procesToApprove: Process = this.filteredProcesses.find(p => p.id == processID);
    let processText = procesToApprove.candidate ? procesToApprove.candidate.name.concat(' ').concat(procesToApprove.candidate.lastName) : procesToApprove.profile;

    this.facade.modalService.confirm({
      nzTitle: 'Are you sure you want to approve the process for ' + processText + '? This will approve all the stages associated with the process',
      nzContent: '',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzCancelText: 'No',
      nzOnOk: () => this.approveProcess(processID)
    });
  }

  approveProcess(processID: number) {
    this.app.showLoading();
    this.facade.processService.approve(processID)
      .subscribe(res => {
        this.getProcesses();
        this.getCandidates();
        this.app.hideLoading();
        this.facade.toastrService.success('Process was approved !');
      }, err => {
        this.app.hideLoading();
        console.log(err);
      });
  }

  showStepsModal(process: Process): void {
    this.emptyProcess = process;
    this.isDetailsVisible = true;
  }

  rejectProcess(processID: number, modalContent: TemplateRef<{}>) {

    this.rejectProcessForm.reset();
    let process: Process = this.filteredProcesses.filter(p => p.id === processID)[0];

    const modal = this.facade.modalService.confirm({
      nzTitle: 'Are you sure delete the process for ' + process.candidate.name + '' + process.candidate.lastName + ' ?',
      nzContent: modalContent,
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzCancelText: 'No',
      nzOnOk: () => {
        this.app.showLoading();
        let isCompleted: boolean = true;
        for (const i in this.rejectProcessForm.controls) {
          this.rejectProcessForm.controls[i].markAsDirty();
          this.rejectProcessForm.controls[i].updateValueAndValidity();
          if ((!this.rejectProcessForm.controls[i].valid)) isCompleted = false;
        }
        if (isCompleted) {

          let rejectionReason = this.rejectProcessForm.controls['rejectionReasonDescription'].value.toString();

          this.facade.processService.reject(processID, rejectionReason)
            .subscribe(res => {
              this.getCandidates();
              this.getProcesses();
              this.app.hideLoading();
              modal.destroy();
              this.facade.toastrService.success('Process and associated candidate were rejected');
            }, err => {
              this.app.hideLoading();
              this.facade.toastrService.error(err.message);
            })
        }
        this.app.hideLoading();
      }
    });

  }

  reset(): void {
    this.searchValue = '';
    this.search();
  }

  resetStatus(): void {
    this.searchValueStatus = '';
    this.searchStatus();
  }

  search(): void {
    const filterFunc = (item) => {
      return (this.listOfSearchProcesses.length ? this.listOfSearchProcesses.some(p => item.candidate.name.indexOf(p) !== -1) : true) &&
        (item.candidate.name.toString().toUpperCase().indexOf(this.searchValue.toUpperCase()) !== -1);
    };
    const data = this.filteredProcesses.filter(item => filterFunc(item));
    this.listOfDisplayData = data.sort((a, b) => (this.sortValue === 'ascend') ? (a[this.sortName] > b[this.sortName] ? 1 : -1) : (b[this.sortName] > a[this.sortName] ? 1 : -1));
    this.searchValue = '';
    this.nameDropdown.nzVisible = false;
  }

  searchStatus(): void {
    const filterFunc = (item) => {
      return (this.listOfSearchProcesses.length ? this.listOfSearchProcesses.some(p => item.status.indexOf(p) !== -1) : true) &&
        (item.status === this.searchValueStatus)
    };
    const data = this.filteredProcesses.filter(item => filterFunc(item));
    this.listOfDisplayData = data.sort((a, b) => (this.sortValue === 'ascend') ? (a[this.sortName] > b[this.sortName] ? 1 : -1) : (b[this.sortName] > a[this.sortName] ? 1 : -1));
    this.searchValueStatus = '';
    this.statusDropdown.nzVisible = false;
  }

  searchProfile(searchedProfile: string) {
    this.profileSearch = searchedProfile;
    if (searchedProfile == 'ALL') this.listOfDisplayData = this.filteredProcesses;
    else {
      this.listOfDisplayData = this.filteredProcesses.filter(p => p.profile == searchedProfile);
    }
  }

  sort(sortName: string, value: boolean): void {
    this.sortName = sortName;
    this.sortValue = value;
    this.search();
  }

  showProcessStart(modalContent: TemplateRef<{}>, footer: TemplateRef<{}>, processId: number): void {
    this.app.showLoading();
    if (processId > -1) {
      this.emptyProcess = this.filteredProcesses.filter(p => p.id === processId)[0];
      this.isEdit = true;
    }
    else this.emptyProcess = undefined;
    const modal = this.facade.modalService.create({
      nzTitle: null,
      nzContent: modalContent,
      nzClosable: false,
      nzWidth: '90%',
      nzFooter: footer
    });
    this.app.hideLoading();
  }

  newProcessStart(modalContent: TemplateRef<{}>, footer: TemplateRef<{}>, candidate: Candidate): void {
    this.app.showLoading();
    this.createEmptyProcess(candidate);
    
    this.currentCandidate = candidate;

    const modal = this.facade.modalService.create({
      nzTitle: null,
      nzContent: modalContent,
      nzClosable: false,
      nzWidth: '90%',
      nzFooter: footer
    });
    this.app.hideLoading();
  }

  // NOT BEING USED
  setCandidateNewStatus(processStatusId: string, candidateId: number): Candidate {
    let processStatus: string = this.statusList[processStatusId].name;
    let candidate: Candidate = this.candidatesFullList.filter(x => x.id === candidateId)[0];
    if (processStatus !== 'NotStarted' && processStatus !== 'Wait') {
      switch (processStatus) {
        case 'Rejected':
          candidate.status = CandidateStatusEnum.Rejected;
          break;
        case 'Finish':
          candidate.status = CandidateStatusEnum.Hired;
          break;
        case 'Process':
          candidate.status = CandidateStatusEnum.InProgress;
          break;
      }
    }
    return candidate;
  }

  showCandidateDetailsModal(candidateID: number, modalContent: TemplateRef<{}>): void {
    this.emptyCandidate = this.candidatesFullList.filter(candidate => candidate.id == candidateID)[0];
    this.candidateDetailsModal.showModal(modalContent, this.emptyCandidate.name + ' ' + this.emptyCandidate.lastName);
  }

  showConsultantDetailsModal(consultantID: number, modalContent: TemplateRef<{}>): void {
    this.emptyConsultant = this.consultants.filter(consultant => consultant.id == consultantID)[0];
    this.consultantDetailsModal.showModal(modalContent, this.emptyConsultant.name + ' ' + this.emptyConsultant.lastName);
  }

  showDeleteConfirm(processID: number): void {
    let procesDelete: Process = this.filteredProcesses.find(p => p.id == processID);
    let processText = procesDelete.candidate ? procesDelete.candidate.name.concat(' ').concat(procesDelete.candidate.lastName) : procesDelete.profile;

    this.facade.modalService.confirm({
      nzTitle: 'Are you sure delete the process for ' + processText + ' ?',
      nzContent: '',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzCancelText: 'No',
      nzOnOk: () => this.facade.processService.delete<Process>(processID)
        .subscribe(res => {
          this.getProcesses();
          this.facade.toastrService.success('Process was deleted !');
        }, err => {
          this.facade.toastrService.error(err.message);
        })
    });
  }

  onCheck(): number {
    let i: number = 0;
    let carouselSlide: number = -1;
    this.forms.forEach(form => {
      form = this.checkForm(form);
      if (form.invalid) {
        carouselSlide = i;
      }
      i++;
    });
    return carouselSlide;
  }

  checkForm(form: FormGroup): FormGroup {
    for (const i in form.controls) {
      form.controls[i].markAsDirty();
      form.controls[i].updateValueAndValidity();
    }
    return form;
  }

  validateForms(): boolean {
    this.getForms();
    let slide: number = this.onCheck();
    if (slide > -1) {
      this.processCarousel.goTo(slide);
      let elementName: string = slide == 0 ? 'candidateButton' : slide == 1 ? 'hrButton' : slide == 2 ? 'technicalButton'
        : slide == 3 ? 'clientButton' : slide == 4 ? 'offerButton' : slide == 5 ? 'hireButton' : 'none';
      this.checkSlideIndex(elementName);
      return false;
    }
    else return true;
  }

  wishedStage(choosenStage: number, elementName: string) {
    this.processCarousel.goTo(choosenStage);
    this.stepIndex = choosenStage;
    // if (choosenStage !== 0) {
    //   var height = document.getElementById('hrStage').style.height;
    //   document.getElementById('idProcessCarousel').style.height = height;
    // }
    this.checkSlideIndex(elementName);
  }


  closeModal() {
    this.facade.modalService.openModals[0].destroy();
    this.isEdit = false;
    this.stepIndex = 0;
  }

  getForms() {
    this.forms = [];
    this.forms.push(this.candidateAdd.candidateForm);
    this.forms.push(this.hrStage.hrForm);
    this.forms.push(this.technicalStage.technicalForm);
    this.forms.push(this.clientStage.clientForm);
    this.forms.push(this.offerStage.offerForm);
  }

  checkSlideIndex(elementName: string) {
    this.currentComponent = elementName;
    if (this.times == 0) {
      this.lastComponent = this.currentComponent;
    }
    document.getElementById('candidateButton').style.borderWidth = '0px';
    document.getElementById('candidateButton').style.borderColor = 'none';

    document.getElementById(this.lastComponent).style.borderWidth = '0px';
    document.getElementById(this.lastComponent).style.borderColor = 'none';
    document.getElementById(this.currentComponent).style.borderWidth = '3px';
    document.getElementById(this.currentComponent).style.borderColor = 'red';
    document.getElementById(this.currentComponent).style.borderRadius = '6px';

    this.times++;
    this.lastComponent = this.currentComponent;
  }


  saveProcess() {
    if (this.validateForms()) {
      this.app.showLoading();
      let newCandidate: Candidate;
      let newProcess: Process;

      newCandidate = this.candidateAdd.getFormData();
      newProcess = this.getProcessFormData();
      newProcess.consultantOwnerId = newCandidate.recruiter;

      newProcess.candidate = newCandidate;

      if (!this.isEdit) {
        this.facade.processService.add<Process>(newProcess)
          .subscribe(res => {
            this.getProcesses();
            this.app.hideLoading();
            this.facade.toastrService.success('The process was successfully saved !');
            this.createEmptyProcess(newCandidate);
            this.closeModal();
          }, err => {
            this.app.hideLoading();
            this.facade.toastrService.error(err.message);
          });
      }
      else {
        this.facade.processService.update<Process>(newProcess.id, newProcess)
          .subscribe(res => {
            this.getProcesses();
            this.getCandidates();
            this.app.hideLoading();
            this.facade.toastrService.success('The process was successfully saved !');
            this.createEmptyProcess(newCandidate);
            this.closeModal();
          }, err => {
            this.app.hideLoading();
            this.facade.toastrService.error(err.message);
          });
      }
    }
  }

  getProcessFormData(): Process {
    let process: Process;
    process = {
      id: !this.isEdit ? 0 : this.emptyProcess.id,
      startDate: new Date(),
      endDate: null,
      status:  !this.isEdit ? ProcessStatusEnum.InProgress : ProcessStatusEnum[CandidateStatusEnum[this.emptyProcess.candidate.status]],
      profile: 'Dev',
      candidateId: !this.isEdit ? 0 : this.emptyProcess.candidate.id,
      candidate: null,
      consultantOwnerId: 0,
      consultantOwner: null,
      consultantDelegateId: 0,
      consultantDelegate: null,
      rejectionReason: null,
      actualSalary: 0,
      wantedSalary: 0,
      agreedSalary: 0,
      englishLevel: EnglishLevelEnum.None,
      seniority: 0,
      hrStage: null,
      technicalStage: null,
      clientStage: null,
      offerStage: null
    };

    process.hrStage = this.hrStage.getFormData(process.id);
    process.technicalStage = this.technicalStage.getFormData(process.id);
    process.clientStage = this.clientStage.getFormData(process.id);
    process.offerStage = this.offerStage.getFormData(process.id);

    // Seniority is now handled global between technical stage and offer stage. The process uses the last updated value.
    process.seniority = this.selectedSeniority ? this.selectedSeniority :
                        (process.technicalStage.seniority ? process.technicalStage.seniority :
                          (process.offerStage.seniority));
    process.englishLevel = process.englishLevel;

    return process;
  }

  getProcessStatus(stages: Stage[]): number {
    let processStatus: number = 0;
    stages.forEach(stage => {
      if (stage.status === StageStatusEnum.InProgress) { processStatus = ProcessStatusEnum.InProgress; }
      if (stage.status === StageStatusEnum.Accepted) { processStatus = ProcessStatusEnum.InProgress; }
      if (stage.status === StageStatusEnum.Declined) { processStatus = ProcessStatusEnum.Declined; }
    });
    if (stages[3].status === StageStatusEnum.Accepted) { processStatus = ProcessStatusEnum.OfferAccepted; }

    if (stages[3].status === StageStatusEnum.Accepted && stages[4].status === StageStatusEnum.InProgress ||
      stages[3].status === StageStatusEnum.Accepted && stages[4].status === StageStatusEnum.Declined) 
      { processStatus = ProcessStatusEnum.Declined; }

    if (stages[4].status === StageStatusEnum.Accepted) { processStatus = ProcessStatusEnum.Hired; }

    return processStatus;
  }



  getStatusColor(status: number): string {
    let statusName = this.statusList.filter(s => s.id == status)[0].name;
    switch (statusName) {
      case 'Hired': return 'success';
      case 'Rejected': return 'error';
      case 'Declined': return 'error';
      case 'In Progress': return 'processing';
      case 'Recall': return 'warning';
      default: return 'default';
    }
  }

  showContactCandidatesModal(modalContent: TemplateRef<{}>) {
    const modal = this.facade.modalService.create({
      nzTitle: null,
      nzContent: modalContent,
      nzClosable: false,
      nzWidth: '90%',
      nzFooter: [
        {
          label: 'Cancel',
          shape: 'default',
          onClick: () => {
            modal.destroy();
            this.refreshTable();
          }
        }]
    });

  }

  refreshTable() {
    this.getProcesses();
    this.getCandidates();
  }

  updateSeniority($event) {
    this.selectedSeniority = $event;
  }

  onStepIndexChange(index: number): void {
    this.stepIndex = index;
  }

  createEmptyProcess(candidate: Candidate) {
    this.emptyProcess = {
      id: 0,
      startDate: new Date(),
      endDate: null,
      status:  ProcessStatusEnum.NA,
      profile: 'Dev',
      candidateId: candidate.id,
      candidate: candidate,
      consultantOwnerId: 0,
      consultantOwner: null,
      consultantDelegateId: 0,
      consultantDelegate: null,
      rejectionReason: null,
      actualSalary: 0,
      wantedSalary: 0,
      agreedSalary: 0,
      englishLevel: EnglishLevelEnum.None,
      seniority: 0,
      hrStage: {
        id: 0,
        date: new Date(),
        status: StageStatusEnum.InProgress,
        feedback: '',
        consultantOwnerId: candidate.recruiter,
        consultantDelegateId: candidate.recruiter,
        processId: 0,
        actualSalary: 0,
        wantedSalary: 0,
        englishLevel: EnglishLevelEnum.None

      },
      technicalStage: {
        id: 0,
        date: new Date(),
        status: StageStatusEnum.NA,
        feedback: '',
        consultantOwnerId: candidate.recruiter,
        consultantDelegateId: candidate.recruiter,
        processId: 0,
        seniority: SeniorityEnum.NA,
        client: ''
      },
      clientStage: {
        id: 0,
        date: new Date(),
        status: StageStatusEnum.NA,
        feedback: '',
        consultantOwnerId: candidate.recruiter,
        consultantDelegateId: candidate.recruiter,
        processId: 0
      },
      offerStage: {
        id: 0,
        date: new Date(),
        status: StageStatusEnum.NA,
        feedback: '',
        consultantOwnerId: candidate.recruiter,
        consultantDelegateId: candidate.recruiter,
        processId: 0,
        agreedSalary: 0,
        seniority: SeniorityEnum.NA,
        offerDate: new Date(),
        hireDate: new Date(),
        backgroundCheckDone: false,
        backgroundCheckDoneDate: new Date(),
        preocupationalDone: false,
        preocupationalDoneDate: new Date()
      },
    };
  }
}
