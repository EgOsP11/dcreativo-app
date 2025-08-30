import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { PushService } from './services/push.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private push: PushService,
  ) {
    this.initializeApp();
  }

  private async initializeApp() {
    await this.platform.ready();

    if (this.platform.is('capacitor')) {
      // Status bar
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#000000' });
      await StatusBar.setStyle({ style: Style.Light });

      // Inicializa Push (pide permisos, registra, guarda token y listeners)
      await this.push.init();
    }
  }
}
