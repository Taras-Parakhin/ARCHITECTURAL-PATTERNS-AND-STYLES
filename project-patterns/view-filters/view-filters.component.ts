import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DatePipe, NgClass} from "@angular/common";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";

import {TableFiltersTypeEnum} from "@core/enums/table-filters-type.enum";
import {ActionEnum} from "@core/enums/action.enum";
import {UnitEnum} from "@core/enums/unit.enum";
import {IBaseFilters} from "@core/interfaces/base-filters.interface";
import {Platform} from "@core/models/platform.model";
import {Role} from "@core/models/user.model";
import {ContentType} from '@core/models/content-type.model';
import {ContentStateEnum} from '@core/enums/content-state.enum';
import {FlagOptionEnum} from "@core/enums/flag-option.enum";
import {SubscriberShort} from "@core/models/subscriber.model";
import {ContentPackageShort} from "@core/models/content-package.model";
import {DeviceShort} from "@core/models/device.model";
import {
  ContentTypeIconComponent
} from "@modules/content/components/shared/content-type-icon/content-type-icon.component";
import {SubscriberActivityLogActionEnum} from "@core/enums/subscriber-activity-log.enum";
import {EntityTypeEnum} from "@core/enums/entity-type.enum";

@Component({
  selector: 'app-view-filters',
  standalone: true,
  imports: [
    MatChipsModule,
    MatIconModule,
    NgClass,
    ContentTypeIconComponent
  ],
  providers: [
    DatePipe
  ],
  templateUrl: './view-filters.component.html',
  styleUrl: './view-filters.component.scss'
})
export class ViewFiltersComponent {

  @Input() type: TableFiltersTypeEnum;
  @Input() filters: IBaseFilters;
  @Input() subscribers: SubscriberShort[];
  @Input() devices: DeviceShort[];
  @Input() contentPackages: ContentPackageShort[];
  @Input() platforms: Platform[];
  @Input() contentTypes: ContentType[];
  @Input() roles: Role[];

  @Output() changeFilter = new EventEmitter<IBaseFilters>();

  public filtersType: typeof TableFiltersTypeEnum = TableFiltersTypeEnum;
  public contentState: typeof ContentStateEnum = ContentStateEnum;
  public subscriberActivityLogEnum = SubscriberActivityLogActionEnum;
  public actionTypeEnum = ActionEnum;
  public entityTypeEnum = EntityTypeEnum;
  public unitEnum: typeof UnitEnum = UnitEnum;
  public flagOptionEnum: typeof FlagOptionEnum = FlagOptionEnum;

  constructor(private datePipe: DatePipe) {
  }

  public get getContentState(): string {
    return this.filters.State === ContentStateEnum.Published
      ? 'Published'
      : 'Unpublished';
  }

  public get viewPlatforms(): string {
    const platforms = this.platforms.filter(platform => this.filters.PlatformId.includes(platform.Id));
    return platforms.map(platform => platform.Name).join(', ');
  }

  public get viewContentTypes(): string {
    const contentTypes = this.contentTypes.filter(contentType => this.filters.ContentTypeId.includes(contentType.Id));
    return contentTypes.map(contentType => contentType.Name).join(', ');
  }

  public get viewRoles(): string {
    const roles = this.roles.filter(role => this.filters.Roles.includes(role.Id));
    return roles.map(role => role.Name).join(', ');
  }

  public get viewAction(): string {
    return this.filters.ActionIds.map(action => this.subscriberActivityLogEnum[action]).join(', ');
  }

  public get viewEntityType(): string {
    return this.filters.EntityType.map(entity => this.entityTypeEnum[entity]).join(', ');
  }

  public get viewDateTimeRange(): string {
    const startPeriod = this.datePipe.transform(this.filters.StartPeriod, 'dd-MM-yy, h:mm a');
    const endPeriod = this.datePipe.transform(this.filters.EndPeriod, 'dd-MM-yy, h:mm a');

    return `${startPeriod} - ${endPeriod}`;
  }

  public get viewDuration(): string {
    const unit = (this.unitEnum as Record<string, string>)[this.filters.Unit];
    const s = this.filters.Duration > 1 ? 's' : '';
    return `${this.filters.Duration} ${unit}${s}`;
  }

  public get viewFlag(): string[] {
    return this.filters.Language.map(language => this.flagOptionEnum[language as keyof typeof FlagOptionEnum]);
  }

  public get viewSubscriber(): string | null {
    if (this.filters.SubscriberId) {
      const subscriber = this.subscribers.find(subscriber => subscriber.Id === this.filters.SubscriberId);
      return subscriber.PublicName;
    } else {
      return null;
    }
  }

  public get viewContentPackage(): ContentPackageShort | null {
    if (this.filters.PackageId) {
      return this.contentPackages.find(contentPackage => contentPackage.Id === this.filters.PackageId);
    } else {
      return null;
    }
  }

  public get viewDevice(): string | null {
    if (this.filters.DeviceId) {
      const device = this.devices.find(device => device.DeviceId === this.filters.DeviceId);
      return device?.Model;
    } else {
      return null;
    }
  }

  public onChangeFilter(...filterFields: (keyof IBaseFilters)[]): void {
    let changedFilter: Partial<IBaseFilters> = {...this.filters};

    for (const filterField of filterFields) {
      const {[filterField]: deletedFilter, ...rest} = changedFilter;
      changedFilter = rest;
    }

    this.changeFilter.emit({
      SearchText: changedFilter.SearchText ?? '',
      Exclude: changedFilter.Exclude ?? false,
      ...this.type === TableFiltersTypeEnum.Devices ? {
        DeviceIsActive: changedFilter.DeviceIsActive,
        PlatformId: changedFilter.PlatformId
      } : {},
      ...this.type === TableFiltersTypeEnum.Subscribers ? {
        State: changedFilter.State
      } : {},
      ...this.type === TableFiltersTypeEnum.ContentPackages ? {
        State: changedFilter.State,
        ContentTypeId: changedFilter.ContentTypeId
      } : {},
      ...this.type === TableFiltersTypeEnum.Notifications ? {
        IsReceived: changedFilter.IsReceived
      } : {},
      ...this.type === TableFiltersTypeEnum.Users ? {
        IsActive: changedFilter.IsActive,
        Roles: changedFilter.Roles
      } : {},
      ...this.type === TableFiltersTypeEnum.SubscriberLogs ? {
        SubscriberName: changedFilter.SubscriberName,
        SubscriberId: changedFilter.SubscriberId,
        PackageName: changedFilter.PackageName,
        PackageId: changedFilter.PackageId,
        DeviceName: changedFilter.DeviceName,
        DeviceId: changedFilter.DeviceId,
        ActionIds: changedFilter.ActionIds,
        StartPeriod: changedFilter.StartPeriod,
        EndPeriod: changedFilter.EndPeriod,
        Duration: changedFilter.Duration,
        Unit: changedFilter.Unit
      } : {},
      ...this.type === TableFiltersTypeEnum.AdminLogs ? {
        ActionType: changedFilter.ActionType,
        EntityType: changedFilter.EntityType,
        StartPeriod: changedFilter.StartPeriod,
        EndPeriod: changedFilter.EndPeriod,
        Duration: changedFilter.Duration,
        Unit: changedFilter.Unit
      } : {},
      ...this.type === TableFiltersTypeEnum.DeviceLogs ? {
        StartPeriod: changedFilter.StartPeriod,
        EndPeriod: changedFilter.EndPeriod,
        Duration: changedFilter.Duration,
        Unit: changedFilter.Unit
      } : {},
      ...this.type === TableFiltersTypeEnum.Dashboard ? {
        StartPeriod: changedFilter.StartPeriod,
        EndPeriod: changedFilter.EndPeriod,
        Duration: changedFilter.Duration,
        Unit: changedFilter.Unit
      } : {},
      ...this.type === TableFiltersTypeEnum.DataBlocks ? {
        Language: changedFilter.Language
      } : {}
    });
  }
}
