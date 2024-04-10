import {Component, OnDestroy, ViewChild} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { Observable } from "rxjs/internal/Observable";

import { ManageDataBlockComponent } from "./manage-data-block.component";
import { DataBlockConfig } from "@core/models/data-block.model";
import { ManageDataBlockService } from "./services/manage-data-block.service";
import { IDeactivateDialog } from "@core/interfaces/deactivate-dialog.interface";

@Component({
  selector: 'app-manage-data-block-container',
  standalone: true,
  imports: [
    AsyncPipe,
    ManageDataBlockComponent,
  ],
  template: `
    <app-manage-data-block #form
      [dataBlockConfig]="dataBlockConfig$ | async"
      (submit)="saveDataBlockConfig($event)"
      (canDeactivate)="checkCanDeactivate($event)"
      (deleteGroup)="onDeleteGroup($event)"
      (deleteField)="onDeleteField($event)"
      (addAssignments)="onAddAssignments()"
      (deleteDataBlock)="onDeleteDataBlock($event)"
    ></app-manage-data-block>
  `
})
export class ManageDataBlockContainerComponent implements OnDestroy, IDeactivateDialog {

  @ViewChild('form') form: ManageDataBlockComponent;

  public dataBlockConfig$: Observable<DataBlockConfig> = this.manageDataBlockService.dataBlockConfig$;
  public canDeactivate: boolean = true;
  public isFormInvalid: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private manageDataBlockService: ManageDataBlockService
  ) {
    this.manageDataBlockService.setDataBlockConfigId(this.route.snapshot.params['id']);
  }

  public saveDataBlockConfig(dataBlockConfig: DataBlockConfig) {
    this.manageDataBlockService.saveDataBlockConfig(dataBlockConfig);
    this.canDeactivate = true;
  }

  public checkCanDeactivate(canDeactivate: boolean): void {
    this.canDeactivate = canDeactivate;
  }

  public onDeleteGroup(id: string): void {
    this.manageDataBlockService.deleteGroup(id);
  }

  public onDeleteField(id: string): void {
    this.manageDataBlockService.deleteField(id);
  }

  public saveChanges(): void {
    this.form.onSubmit();
  }

  public onAddAssignments() {
    this.manageDataBlockService.onAddAssignments();
  }

  public onDeleteDataBlock(dataBlock: DataBlockConfig): void {
    this.manageDataBlockService.confirmDeleteDataBlock(dataBlock);
  }

  ngOnDestroy() {
    this.manageDataBlockService.clear();
  }
}
