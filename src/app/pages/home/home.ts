import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n/i18n';

@Component({
  imports: [MatButtonModule, MatCardModule, RouterLink],
  selector: 'mj-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  // Signal com os textos do idioma atual: quando o idioma muda, o template atualiza sozinho
  protected readonly t = inject(I18n).t;
}
