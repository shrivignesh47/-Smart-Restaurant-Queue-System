import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cancellation-dialog',
  template: `
    <div class="premium-dialog">
        <div class="dialog-header">
            <div class="header-icon">
                <mat-icon>report_problem</mat-icon>
            </div>
            <h2 mat-dialog-title>Confirm Cancellation</h2>
            <button mat-icon-button class="close-btn" (click)="onNoClick()">
                <mat-icon>close</mat-icon>
            </button>
        </div>

        <mat-dialog-content class="dialog-body">
            <p class="description">
                Are you sure you want to cancel this reservation? This action cannot be undone.
            </p>
            
            <form [formGroup]="cancelForm" class="cancellation-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Reason for Cancellation</mat-label>
                    <textarea matInput 
                              formControlName="reason" 
                              rows="4" 
                              placeholder="Please tell us why you're cancelling..."></textarea>
                    <mat-hint>Minimum 5 characters required</mat-hint>
                    <mat-error *ngIf="cancelForm.get('reason')?.hasError('required')">
                        A reason is required to proceed.
                    </mat-error>
                    <mat-error *ngIf="cancelForm.get('reason')?.hasError('minlength')">
                        Please provide a bit more detail.
                    </mat-error>
                </mat-form-field>
            </form>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="dialog-footer">
            <button mat-button (click)="onNoClick()" class="secondary-btn">
                Keep Reservation
            </button>
            <button mat-flat-button 
                    color="warn" 
                    [disabled]="cancelForm.invalid" 
                    (click)="onConfirm()"
                    class="primary-btn">
                <mat-icon>check_circle</mat-icon>
                Cancel Booking
            </button>
        </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .premium-dialog {
        background: white;
        border-radius: 28px;
        overflow: hidden;
        padding: 8px;
    }

    .dialog-header {
        position: relative;
        padding: 24px 24px 16px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;

        .header-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: #fff5f5;
            color: #ee5d50;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            box-shadow: 0 8px 16px rgba(238, 93, 80, 0.1);

            mat-icon {
                font-size: 32px;
                width: 32px;
                height: 32px;
            }
        }

        h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            color: #1b2559;
            letter-spacing: -0.5px;
        }

        .close-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            color: #a3aed0;
        }
    }

    .dialog-body {
        padding: 16px 24px 24px !important;
        margin: 0 !important;

        .description {
            color: #a3aed0;
            text-align: center;
            margin-bottom: 24px;
            font-size: 15px;
            line-height: 1.6;
        }
    }

    .cancellation-form {
        .full-width {
            width: 100%;
        }

        ::ng-deep .mat-mdc-form-field-focus-overlay {
            background-color: transparent !important;
        }

        ::ng-deep .mat-mdc-text-field-wrapper {
            background-color: #f8faff !important;
            border-radius: 16px !important;
        }
    }

    .dialog-footer {
        padding: 16px 24px 24px;
        gap: 12px;

        button {
            border-radius: 14px;
            font-weight: 700;
            padding: 24px 20px;
            height: auto;
            line-height: normal;

            mat-icon {
                margin-right: 8px;
            }
        }

        .secondary-btn {
            color: #1b2559;
            background: #f4f7fe;
            &:hover {
                background: #e9effd;
            }
        }

        .primary-btn {
            background: #ee5d50;
            box-shadow: 0 10px 20px rgba(238, 93, 80, 0.2);
            
            &:disabled {
                background: #f4f7fe;
                color: #a3aed0;
                box-shadow: none;
            }
        }
    }
  `]
})
export class CancellationDialogComponent {
  cancelForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CancellationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.cancelForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.cancelForm.valid) {
      this.dialogRef.close(this.cancelForm.value.reason);
    }
  }
}
