import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NgClass } from "@angular/common";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";
import { RxReactiveFormsModule, RxwebValidators } from "@rxweb/reactive-form-validators"
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "@danielmoncada/angular-datetime-picker";
import { ToastrService } from "ngx-toastr";

import { DataBlockConfig, DataBlockField, DataBlockGroup } from "@core/models/data-block.model";
import { FieldTypesEnum } from "@core/enums/field-types.enum";
import { AddFieldDialogService } from "./add-field-dialog/services/add-field-dialog.service";
import { FormHelperService } from '@core/helpers/form.service';
import { ConfirmationDialogService } from "@shared/confirmation-dialog/services/confirmation-dialog.service";
import { DataBlockValidator } from "@core/validators/data-block.validator";
import { iconList } from '../../../../../assets/icon-list';
import { ISelectConstant } from "@core/interfaces/select-constant.interface";
import { LanguageOptionEnum } from "@core/enums/language-option.enum";
import { SelectConstants } from "@core/constants/select.constants";

@Component({
  selector: 'app-manage-data-block',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatCardModule,
    MatDividerModule,
    MatMenuModule,
    RouterLink,
    NgClass,
  ],
  templateUrl: './manage-data-block.component.html',
  styleUrl: './manage-data-block.component.scss'
})
export class ManageDataBlockComponent {

  private _dataBlockConfig: DataBlockConfig;

  @Input() set dataBlockConfig(value: DataBlockConfig) {
    this._dataBlockConfig = value;
    this._patchDataBlockConfigValues(value);
  }

  @Output() deleteDataBlock = new EventEmitter<DataBlockConfig>();
  @Output() addAssignments = new EventEmitter();
  @Output() submit = new EventEmitter<DataBlockConfig>();
  @Output() canDeactivate = new EventEmitter<boolean>();
  @Output() deleteGroup = new EventEmitter<string>();
  @Output() deleteField = new EventEmitter<string>();

  get dataBlockConfig(): DataBlockConfig {
    return this._dataBlockConfig;
  }

  public form: FormGroup;
  public fieldTypes = FieldTypesEnum;
  public icons: string[] = iconList;
  public isGroupFieldMoved: boolean = false;
  public requiredFieldControlNames: string[] = ['Name', 'AllowedValues'];
  public languageOptions: ISelectConstant<string, LanguageOptionEnum>[] = SelectConstants.languageOptions();

  constructor(
    private fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private addFieldDialogService: AddFieldDialogService,
    private toaster: ToastrService
  ) {
    this._buildForm();
  }

  public compareFn(optionOne: ISelectConstant<string, LanguageOptionEnum>, optionTwo: ISelectConstant<string, LanguageOptionEnum>): boolean {
    return optionOne.value === optionTwo.value;
  }

  public get isEditMode(): boolean {
    return Boolean(this.dataBlockConfig);
  }

  public getAutocompleteIcons(value: string): string[] {
    return this._filterIcons(value || '')
  }

  private _filterIcons(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.icons.filter(icon => icon.toLowerCase().includes(filterValue));
  }

  public hasError(group: AbstractControl, controlName: string, errorName: string): boolean {
    return FormHelperService.hasError(group, controlName, errorName);
  }

  public hasControlError(controlName: AbstractControl, errorName: string): boolean {
    return FormHelperService.hasControlError(controlName, errorName);
  }

  public getGroupControls(): AbstractControl[] {
    return (this.form.get('Groups') as FormArray).controls;
  }

  public getFieldControls(group: AbstractControl): AbstractControl[] {
    return (group.get('Fields') as FormArray).controls;
  }

  public getControlValue(control: AbstractControl, fieldName: string): string {
    return control.get(fieldName).value;
  }

  private _buildForm(): void {
    this.form = this.fb.nonNullable.group({
      Name: ['', Validators.required],
      Language: this.languageOptions.find(option => option.value === null),
      Description: '',
      Order: null,
      Groups: this.fb.array([])
    });
  }

  private _patchDataBlockConfigValues(dataBlockConfig: DataBlockConfig): void {
    if (dataBlockConfig) {
      this.form = this.fb.nonNullable.group({
        Id: new FormControl(this.dataBlockConfig?.Id),
        Name: new FormControl(this.dataBlockConfig?.Name),
        Language: new FormControl(this.languageOptions.find(option => option.value === this.dataBlockConfig?.Language)),
        Description: new FormControl(this.dataBlockConfig?.Description),
        Order: new FormControl(this.dataBlockConfig?.Order),
        Groups: this.fb.array(this.dataBlockConfig?.Groups?.map((group: DataBlockGroup) => this._mapGroupControls(group)))
      });
    }

    if (this.isEditMode) {
      this.form.valueChanges.subscribe(() => {
        this.canDeactivate.emit(!this.form.dirty);
      });
    }
  }

  private _mapGroupControls(group: DataBlockGroup): FormGroup {
    return this.fb.group({
      Id: new FormControl(group.Id),
      Name: new FormControl(group.Name, [Validators.required, RxwebValidators.unique()]),
      Description: new FormControl(group.Description),
      Icon: new FormControl(group.Icon, [DataBlockValidator.isInclude(this.icons)]),
      Order: new FormControl(group.Order),
      Fields: this.fb.array(group.Fields.map((field: DataBlockField) => this._mapFieldControls(field)))
    });
  }

  private _mapFieldControls(field: DataBlockField): FormGroup {
    return this.fb.group({
      Id: new FormControl(field.Id),
      Name: new FormControl(field.Name, [Validators.required, RxwebValidators.unique()]),
      Description: new FormControl(field.Description),
      Icon: new FormControl(field.Icon, [DataBlockValidator.isInclude(this.icons)]),
      Order: new FormControl(field.Order),
      AllowedValues: new FormControl(field.AllowedValues?.join(', '),
        (field.Type === this.fieldTypes.multiselect || field.Type === this.fieldTypes.dropdown)
          ? [Validators.required, DataBlockValidator.wordCount(2)]
          : null),
      DefaultValue: new FormControl(field.DefaultValue),
      Type: new FormControl(field.Type),
      IsDisplayed: new FormControl(field.IsDisplayed),
      IsRequired: new FormControl(field.IsRequired),
      IsReadonly: new FormControl(field.IsReadonly),
      MinValue: new FormControl(field.MinValue),
      MaxValue: new FormControl(field.MaxValue),
      Validator: new FormControl(field.Validator),
      ValidationErrorMessage: new FormControl(field.ValidationErrorMessage)
    }, {validators: DataBlockValidator.isMinGreaterMax()});
  }

  public addField(group: AbstractControl, indexGroup: number): void {
    if (this._isRequiredError()) {
      this.toaster.warning('Fill all required fields');
      return;
    }
    if (this.form.invalid) {
      this.toaster.warning('You entered incorrect data');
      return;
    }

    this.addFieldDialogService.open(
      'Choose a field type'
    )
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const fieldForm = this.fb.group({
            Name: new FormControl('', [Validators.required, RxwebValidators.unique()]),
            Description: new FormControl(''),
            Icon: new FormControl('', [DataBlockValidator.isInclude(this.icons)]),
            Order: new FormControl(this.getFieldControls(group).length + 1),
            AllowedValues: new FormControl('',
              (result === this.fieldTypes.multiselect || result === this.fieldTypes.dropdown)
                ? [Validators.required, DataBlockValidator.wordCount(2)]
                : null),
            DefaultValue: new FormControl(''),
            Type: new FormControl(result),
            IsDisplayed: new FormControl(true),
            IsRequired: new FormControl(false),
            IsReadonly: new FormControl(false),
            MinValue: new FormControl(null),
            MaxValue: new FormControl(null),
            Validator: new FormControl(''),
            ValidationErrorMessage: new FormControl('')
          }, {validators: DataBlockValidator.isMinGreaterMax()});

          (this.getGroupControls()[indexGroup].get('Fields') as FormArray).push(fieldForm);
          this.form.updateValueAndValidity();
        }
      })
  }

  private _isFieldAbsent(): boolean {
    return this.getGroupControls().some(group => !(group.get('Fields') as FormArray).controls.length);
  }

  public addGroup(): void {
    if (this._isRequiredError()) {
      this.toaster.warning('Fill all required fields');
      return;
    }

    if (this._isFieldAbsent()) {
      this.toaster.warning(this.getGroupControls().length === 1 ? 'Add field' : 'Add field in empty group or remove this group');
      return;
    }

    if (this.form.invalid) {
      this.toaster.warning('You entered incorrect data');
      return;
    }

    const groupForm = this.fb.group({
      Name: new FormControl('', [Validators.required, RxwebValidators.unique()]),
      Description: new FormControl(''),
      Icon: new FormControl('', [DataBlockValidator.isInclude(this.icons)]),
      Order: new FormControl(this.getGroupControls().length + 1),
      Fields: this.fb.array([])
    });

    (this.form.get('Groups') as FormArray).push(groupForm);
    this.form.updateValueAndValidity();
  }

  public removeField(dataBlockGroup: AbstractControl, indexGroup: number, indexField: number): void {
    const fieldName = this.getFieldControls(dataBlockGroup)[indexField].value.Name;
    const fieldId = this.getFieldControls(dataBlockGroup)[indexField].value.Id;

    this.confirmationDialogService.open(
      'Delete data block field',
      `Are you sure you want to delete "${fieldName}" field?`
    )
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const fields = this.getGroupControls()[indexGroup].get('Fields') as FormArray;

          fields.removeAt(indexField);

          if (fields.length) {
            this.getFieldControls(dataBlockGroup)
              .map((fieldControl, index) => fieldControl.get('Order').patchValue(index + 1));
          }

          if (fieldId) {
            this.form.markAsDirty();
            this.deleteField.emit(fieldId);
          }
        }
     });
  }

  public removeGroup(indexGroup: number): void {
    const groupName = this.getGroupControls()[indexGroup].value.Name;
    const groupId = this.getGroupControls()[indexGroup].value.Id;

    this.confirmationDialogService.open(
      'Delete data block group',
      `Are you sure you want to delete "${groupName} group?`
    )
      .afterClosed()
      .subscribe(result => {
        if (result) {
          (this.form.get('Groups') as FormArray).removeAt(indexGroup);
          this.getGroupControls()
            .map((groupControl, index) => groupControl.get('Order').patchValue(index + 1));

          if (groupId) {
            this.form.markAsDirty();
            this.deleteGroup.emit(groupId);
          }
        }
      });
  }

  public dropField(event: CdkDragDrop<string[]>, dataBlockGroup: AbstractControl): void {
    moveItemInArray(this.getFieldControls(dataBlockGroup), event.previousIndex, event.currentIndex);
    this.getFieldControls(dataBlockGroup)
      .map((fieldControl, index) => fieldControl.get('Order').patchValue(index + 1));

    this.isGroupFieldMoved = true;
    this.canDeactivate.emit(false);
  }

  public dropGroup(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.getGroupControls(), event.previousIndex, event.currentIndex);
    (this.form.get('Groups') as FormArray).controls
      .map((groupControl, index) => groupControl.get('Order').patchValue(index + 1))

    this.isGroupFieldMoved = true;
    this.canDeactivate.emit(false);
  }

  private _isRequiredError(): boolean {
    const hasDataBlockRequireError = this.hasControlError(this.form.get('Name'), 'required');
    const hasGroupRequireError = this.getGroupControls()
      .some(groupControl => this.hasError(groupControl, 'Name', 'required'));
    const hasFieldRequireError = this.getGroupControls()
      .some(groupControl => (groupControl.get('Fields') as FormArray).controls
        .some(fieldControl => this.requiredFieldControlNames.some(name => this.hasError(fieldControl, name, 'required'))));

    return hasFieldRequireError || hasGroupRequireError || hasDataBlockRequireError;
  }

  public onSubmit(): void {
    FormHelperService.markAllAsTouched(this.form);

    if (this._isRequiredError()) {
      this.toaster.warning('Fill all required fields');
      return;
    }

    if (!this.getGroupControls().length) {
      this.toaster.warning('Add at least one group and one field');
      return;
    }

    if (this._isFieldAbsent()) {
      this.toaster.warning(this.getGroupControls().length === 1 ? 'Add field' : 'Add field in empty group or remove this group');
      return;
    }

    if (this.form.invalid) {
      this.toaster.warning('You entered incorrect data');
      return;
    }

    const dataBlockConfig = this.form.value.Groups
      .map((group: DataBlockGroup) => {
        group.Fields
          .map((field: DataBlockField) => {
            if ((field.Type === this.fieldTypes.multiselect || field.Type === this.fieldTypes.dropdown) && field.AllowedValues) {
              field.AllowedValues = (field.AllowedValues.toString()).split(',').map((word: string) => word.trim());
            } else {
              field.AllowedValues = null;
            }

            return field;
          });

          return group;
        }
      );

    this.submit.emit({...this.form.value, Groups: dataBlockConfig, Language: this.form.get('Language').value['value']});
    this.isGroupFieldMoved = false;
  }

  public onAddAssignments(): void {
    this.addAssignments.emit();
  }

  public onDelete(dataBlock: DataBlockConfig): void {
    this.deleteDataBlock.emit(dataBlock);
  }

}
