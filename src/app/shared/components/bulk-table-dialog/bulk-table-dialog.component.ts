import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-bulk-table-dialog',
  template: `
    <h2 mat-dialog-title>Bulk Add Tables</h2>
    <mat-dialog-content>
      <form [formGroup]="bulkForm" class="flex flex-col gap-4 mt-2">
        <div formArrayName="specs">
          <div *ngFor="let spec of specs.controls; let i=index" [formGroupName]="i" class="spec-row mb-4 p-3 border rounded">
            <div class="flex justify-between items-center mb-2">
              <h4 class="m-0">Batch #{{i + 1}}</h4>
              <button mat-icon-button color="warn" (click)="removeSpec(i)" *ngIf="specs.length > 1">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="Normal">Normal (NT-Series)</mat-option>
                  <mat-option value="VIP">VIP (VT-Series)</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Capacity (Seats)</mat-label>
                <input matInput type="number" formControlName="capacity">
              </mat-form-field>

              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>How many tables to create?</mat-label>
                <input matInput type="number" formControlName="count">
              </mat-form-field>
            </div>
          </div>
        </div>

        <button mat-stroked-button color="accent" type="button" (click)="addSpec()" class="w-full">
          <mat-icon>add</mat-icon> Add Another Batch
        </button>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="bulkForm.invalid" (click)="save()">Create Tables</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .gap-4 { gap: 1rem; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .col-span-2 { grid-column: span 2; }
    .spec-row { background: #fdfdfd; }
  `]
})
export class BulkTableDialogComponent {
  bulkForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BulkTableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.bulkForm = this.fb.group({
      specs: this.fb.array([this.createSpec()])
    });
  }

  get specs() {
    return this.bulkForm.get('specs') as FormArray;
  }

  createSpec(): FormGroup {
    return this.fb.group({
      type: ['Normal', Validators.required],
      capacity: [2, [Validators.required, Validators.min(1)]],
      count: [1, [Validators.required, Validators.min(1), Validators.max(50)]]
    });
  }

  addSpec() {
    this.specs.push(this.createSpec());
  }

  removeSpec(index: number) {
    this.specs.removeAt(index);
  }

  save() {
    if (this.bulkForm.valid) {
      this.dialogRef.close(this.bulkForm.value.specs);
    }
  }
}
