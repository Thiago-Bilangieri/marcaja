import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  imports: [MatButtonModule, MatCardModule],
  selector: 'mj-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  // Signal: um valor reativo; quando muda, o template é atualizado sozinho
  protected readonly features = signal<Feature[]>([
    {
      icon: 'event_busy',
      title: 'Sem conflito de horário',
      description: 'Um profissional nunca tem dois agendamentos no mesmo horário.',
    },
    {
      icon: 'verified_user',
      title: 'Profissionais aprovados',
      description: 'Cada profissional passa pela aprovação de um administrador antes de atender.',
    },
    {
      icon: 'lock',
      title: 'Seus dados, só seus',
      description: 'Login seguro com JWT: cada pessoa vê e altera apenas o que é dela.',
    },
  ]);
}
