import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {invoke} from "@tauri-apps/api/core";
import {check, Update} from '@tauri-apps/plugin-updater';
import {ask, message} from '@tauri-apps/plugin-dialog';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {relaunch} from "@tauri-apps/plugin-process";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, HttpClientModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    private http = inject(HttpClient)

    greetingMessage = "";

    greet(event: SubmitEvent, name: string): void {
        event.preventDefault();

        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        invoke<string>("greet", {name}).then((text) => {
            this.greetingMessage = text;
        });
    }

    async checkForUpdates(onUserClick = false) {
        const update = await check()


        if (update === null) {
            await message('Failed to check for updates.\nPlease try again later.', {
                title: 'Error',
                kind: 'error',
                okLabel: 'OK',
            });
            return;
        } else if (update?.available) {
            let downloaded = 0;
            let contentLength: number|undefined = 0;

            const yes = await ask(`Update to ${update.version} is available!\n\nRelease notes: ${update.body}`, {
                title: 'Update Available',
                kind: 'info',
                okLabel: 'Update',
                cancelLabel: 'Cancel'
            });

            if (yes){
                console.log('INSTALL UPDATES')
                await update.downloadAndInstall((ev) => {
                    console.log(ev)
                    switch (ev.event){
                        case "Started":
                            contentLength = ev.data.contentLength;
                            console.log(`started downloading ${ev.data.contentLength} bytes`);
                            break;
                        case "Progress":
                            downloaded += ev.data.chunkLength;
                            console.log(`downloaded ${downloaded} from ${contentLength}`);
                            break;
                        case "Finished":
                            console.log('Download finished');
                            break;
                    }
                });

                await relaunch();
            }
        } else if (onUserClick){
            await message('You are on the latest version.', {
                title: 'No Update Available',
                kind: 'info',
                okLabel: 'OK'
            })
        }

    }

    async checkUrl() {
        this.http.get('https://gist.githubusercontent.com/QuirkyQueryQuester/6f2e72bfc171cc2f4709c8584eac3a9c/raw/latest.json').subscribe(res => {
            console.log(res)
        })
    }
}
