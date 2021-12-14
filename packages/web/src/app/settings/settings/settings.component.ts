import { Component } from '@angular/core'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  settings: readonly { title: string; icon: string; link: string }[] = [
    {
      title: 'Standplaatsen',
      icon: 'home-map-marker',
      link: 'standplaatsen',
    },
    {
      title: 'Ploegen',
      icon: 'account-group',
      link: 'ploegen',
    },
    {
      title: 'DMR',
      icon: 'radio-handheld',
      link: 'standplaatsen',
    },
    {
      title: 'Operatoren',
      icon: 'headset',
      link: 'standplaatsen',
    },
  ]
}
