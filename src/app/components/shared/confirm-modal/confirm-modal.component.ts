import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements AfterViewInit {
  @Input() title: string = 'Confirmar';
  @Input() message: string = '¿Está seguro?';
  @Input() confirmButtonText: string = 'Aceptar';
  @Input() cancelButtonText: string = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('modal') modal!: ElementRef;
  private modalInstance: any;

  ngAfterViewInit() {
    this.modalInstance = new bootstrap.Modal(this.modal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
  }

  openModal() {
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }

  onCancel() {
    this.cancel.emit();
    this.closeModal();
  }
}
