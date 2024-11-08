import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {invoke} from "@tauri-apps/api/core";
import {check} from '@tauri-apps/plugin-updater';
import {ask, message} from '@tauri-apps/plugin-dialog';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    greetingMessage = "";

    greet(event: SubmitEvent, name: string): void {
        event.preventDefault();

        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        invoke<string>("greet", {name}).then((text) => {
            this.greetingMessage = text;
        });
    }

    async checkForUpdates(onUserClick = false) {
        const update = await check();

        if (update === null) {
            await message('Failed to check for updates.\nPlease try again later.', {
                title: 'Error',
                kind: 'error',
                okLabel: 'OK',
            });
            return;
        } else if (update?.available) {
            const yes = await ask(`Update to ${update.version} is available!\n\nRelease notes: ${update.body}`, {
                title: 'Update Available',
                kind: 'info',
                okLabel: 'Update',
                cancelLabel: 'Cancel'
            });

            if (yes){
                console.log('INSTALL UPDATES')
            }
        }
    }
}
