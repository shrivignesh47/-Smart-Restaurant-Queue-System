import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-admin-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class AdminSidebarComponent {
    @Input() activeTab: string = 'overview';
    @Output() activeTabChange = new EventEmitter<string>();
    @Output() logout = new EventEmitter<void>();

    onTabChange(tab: string) {
        this.activeTab = tab;
        this.activeTabChange.emit(tab);
    }

    onLogout() {
        this.logout.emit();
    }
}
