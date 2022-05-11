import { Component, OnInit } from '@angular/core';
import { RolesService } from 'app/core/roles/roles.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Role } from 'app/core/models/role';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorsService } from 'app/core/errors/errors.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-pending-payouts',
  templateUrl: './pending-payouts.component.html',
  styleUrls: ['./pending-payouts.component.scss']
})
export class PendingPayoutsComponent implements OnInit {
  displayedColumns: string[] = ['select', 'name', 'status', 'price', 'fee', 'payout', 'order', 'action', 'button'];
  selectedPayouts: any[] = [];
  itemperpage: number = 5;
  pageSizeOption = [2, 5, 10];
  totalData: number = 0;
  selection = new SelectionModel<any>(true, []);
  initialSelection = [];
  allowMultiSelect = true;
  payouts: any[] = [];
  filteredPayouts: any[] = [];
  nfts: any[] = [];
  users: any[] = [];
  payoutStatus = 'pending';
  payoutStatusForm: FormGroup;
  options: string[] = ['all', 'pending', 'cleared'];
  formFieldHelpers: string[] = [''];
  selectedFilter: string = 'all';
  tableData = { pageIndex: 0 };
  names: any[] = [
    { key: 'Name', value: 'nftName' },
    { key: 'Status', value: 'status' }
  ];
  selectedCollection: string = 'nftName';
  constructor(
    private roleService: RolesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private errorService: ErrorsService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.payoutStatusForm = this.formBuilder.group({});
    this.getPendingPayouts();
  }

  getPendingPayouts() {
    this.roleService.getFilterPayout('all', this.tableData.pageIndex + 1, this.itemperpage).subscribe((data: any) => {
      this.totalData = data.payoutCount;
      this.payouts = data.payouts;
      this.filteredPayouts = data.payouts;
    });
  }
  onChangedPage(event) {
    this.tableData = { pageIndex: event.pageIndex };
    this.roleService.getFilterPayout(this.selectedFilter, event.pageIndex + 1, event.pageSize).subscribe((data: any) => {
      this.totalData = data.payoutCount;
      this.payouts = data.payouts;
      this.filteredPayouts = data.payouts;
    });
  }

  approveAll() {
    this.roleService
      .approveAllPayouts({
        payouts: JSON.stringify(this.selection.selected)
      })
      .subscribe(
        (response) => {
          this.getPendingPayouts();
        },
        (error) => {
          this.errorService.openSnackBar(error.error.message, 'Error');
          console.error('Something happened during payout attempt', error.error.message);
        }
      );
  }

  approvePayout(payoutId) {
    if (payoutId !== null) {
      this.roleService
        .approvePayout({
          id: payoutId
        })
        .subscribe(
          (response) => {
            this.errorService.openSnackBar('Payout approved successfully!', 'Success');
            this.getPendingPayouts();
          },
          (error) => {
            this.errorService.openSnackBar(error.error.message, 'Error');
            console.error('Something happened during payout attempt', error.error.message);
          }
        );
    }
  }

  isSuperAdmin(): boolean {
    return this.authService.isAdmin();
  }

  filter(event) {
    this.roleService.getFilterPayout(event.value, this.tableData.pageIndex + 1, this.itemperpage).subscribe((data: any) => {
      this.totalData = data.payoutCount;
      this.payouts = data.payouts;
      this.filteredPayouts = data.payouts;
    });
  }

  searchFilter(event) {
    this.roleService.getSearchFilterPayout(this.selectedCollection, event.target.value, this.tableData.pageIndex + 1, this.itemperpage).subscribe((data: any) => {
      this.totalData = data.payoutCount;
      this.payouts = data.payouts;
      this.filteredPayouts = data.payouts;
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.filteredPayouts.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  /*eslint-disable */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.filteredPayouts.forEach((row) => {
          if (row.status === 'pending') {
            this.selection.select(row);
          }
        });
    this.selectedPayouts.push(this.selection.selected);

    console.log(this.selectedPayouts);
  }
  /*eslint-enable */
}
