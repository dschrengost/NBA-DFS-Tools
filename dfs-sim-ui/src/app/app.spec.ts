import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render layout shell with router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement as HTMLElement;

    const layout = el.querySelector('.layout');
    expect(layout).withContext('layout container missing').not.toBeNull();

    expect(layout?.querySelector('aside.nav')).withContext('left nav missing').not.toBeNull();
    expect(layout?.querySelector('main.content')).withContext('main content missing').not.toBeNull();
    expect(layout?.querySelector('aside.inspector')).withContext('right inspector missing').not.toBeNull();

    const outlet = el.querySelector('router-outlet');
    expect(outlet).withContext('router-outlet missing').not.toBeNull();
  });
});
