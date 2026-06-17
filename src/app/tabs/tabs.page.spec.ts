import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    fixture.detectChanges();
  });

  it('should render meditation as the primary footer action', () => {
    const meditateTab: HTMLElement | null = fixture.nativeElement.querySelector('ion-tab-button[tab="timer"]');

    expect(meditateTab?.classList.contains('primary-tab')).toBeTrue();
    expect(meditateTab?.getAttribute('aria-label')).toBe('Méditer');
    expect(meditateTab?.querySelector('ion-icon')?.getAttribute('name')).toBe('leaf-outline');
  });
});
