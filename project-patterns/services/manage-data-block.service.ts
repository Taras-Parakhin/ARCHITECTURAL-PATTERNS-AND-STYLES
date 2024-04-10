import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';

import * as fromSelectors from '../store/manage-data-block.selectors';
import * as fromActions from '../store/manage-data-block.actions';

import { DataBlockConfig } from "@core/models/data-block.model";
import { DataBlocksApiService } from "@core/services/api/data-blocks-api.service";

@Injectable({
  providedIn: 'root'
})
export class ManageDataBlockService {

  public dataBlockConfig$: Observable<DataBlockConfig> = this.store.select(fromSelectors.selectDataBlockConfig);

  constructor(
    private store: Store,
    private dataBlocksApiService: DataBlocksApiService,
  ) { }

  public setDataBlockConfigId(dataBlockConfigId: string): void {
    this.store.dispatch(fromActions.ManageDataBlock.setDataBlockConfigId({ dataBlockConfigId }));
  }

  public clear(): void {
    this.store.dispatch(fromActions.ManageDataBlock.clear());
  }

  // Save data block
  public saveDataBlockConfig(dataBlockConfig: DataBlockConfig) {
    this.store.dispatch(fromActions.ManageDataBlock.saveDataBlockConfig({ data: dataBlockConfig }));
  }

  public onAddAssignments(): void {
    this.store.dispatch(fromActions.ManageDataBlock.openAddAssignmentsDialog());
  }

  // Delete data block
  public confirmDeleteDataBlock(dataBlock: DataBlockConfig): void {
    this.store.dispatch(fromActions.ManageDataBlock.confirmDeleteDataBlock({ data: dataBlock }));
  }

  // Delete data block group
  public deleteGroup(id: string): void {
    this.store.dispatch(fromActions.ManageDataBlock.deleteDataBlockGroup( { groupId: id }));
  }

  // Delete data block group field
  public deleteField(id: string): void {
    this.store.dispatch(fromActions.ManageDataBlock.deleteDataBlockField( { fieldId: id }));
  }

  // API Call: Create data block configuration
  public createDataBlockConfig(data: DataBlockConfig): Observable<DataBlockConfig> {
    return this.dataBlocksApiService.createDataBlockConfig(data);
  }

  // API Call: Update data block configuration
  public updateDataBlockConfig(data: DataBlockConfig): Observable<void> {
    return this.dataBlocksApiService.updateDataBlockConfig(data);
  }

  // API Call: Fetch data block from API
  public fetchDataBlockConfig(dataBlockConfigId: string): Observable<DataBlockConfig> {
    return this.dataBlocksApiService.fetchDataBlockConfig(dataBlockConfigId);
  }

  // API Call: Delete data block
  public deleteDataBlock(dataBlock: DataBlockConfig): Observable<void> {
    return this.dataBlocksApiService.deleteDataBlocks([dataBlock]);
  }

}
