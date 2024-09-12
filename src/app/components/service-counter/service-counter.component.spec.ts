import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorSubject, Observable, of } from 'rxjs';

import { CounterService } from '../../services/counter.service';
import { click, expectText, setFieldValue } from '../../spec-helpers/element.spec-helper';
import { ServiceCounterComponent } from './service-counter.component';

describe('ServiceCounterComponent: integration test', () => {
  let fixture: ComponentFixture<ServiceCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceCounterComponent],
      providers: [CounterService], // This line adds the CounterService to the testing Module
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCounterComponent);
    fixture.detectChanges();
  });

  it('shows the start count', () => {
    expectText(fixture, 'count', '0');
  });

  // check if the count has incremented after the increment button was clicked
  it('increments the count', () => {
    click(fixture, 'increment-button');
    fixture.detectChanges();
    expectText(fixture, 'count', '1');
  });

  // check if the count has decremented after the decrement button was clicked
  it('decrements the count', () => {
    click(fixture, 'decrement-button');
    fixture.detectChanges();
    expectText(fixture, 'count', '-1');
  });

  // check if the count has been reset after the reset button was clicked
  it('resets the count', () => {
    const newCount = 456;
    setFieldValue(fixture, 'reset-input', String(newCount));
    click(fixture, 'reset-button');
    fixture.detectChanges();
    expectText(fixture, 'count', String(newCount));
  });
});

/** Unit Test for the ServiceCounterComponent
  2 main requirements of fake dependencies
  - Equivalen of fake and original: the fake must have a type derived from the original
  - Effective faking: the original stays untouched
*/
describe('ServiceCounterComponent: unit test', () => {
  const currentCount = 123;

  let fixture: ComponentFixture<ServiceCounterComponent>;
  // Declare shared variable
  let fakeCounterService: CounterService;

  beforeEach(async () => {
    // ACT phase
    // This code creates an object with four methods, all of them being spies.
    fakeCounterService = jasmine.createSpyObj<CounterService>('CounterService', {
      getCount: of(currentCount),
      increment: undefined,
      decrement: undefined,
      reset: undefined,
    });

    await TestBed.configureTestingModule({
      declarations: [ServiceCounterComponent],
      // Use fake instead of original
      providers: [{ provide: CounterService, useValue: fakeCounterService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCounterComponent);
    fixture.detectChanges();
  });

  // ASSERT face
  it('shows the count', () => {
    expectText(fixture, 'count', String(currentCount));
    expect(fakeCounterService.getCount).toHaveBeenCalled();
  });

  it('increments the count', () => {
    click(fixture, 'increment-button');
    expect(fakeCounterService.increment).toHaveBeenCalled();
  });

  it('decrements the count', () => {
    click(fixture, 'decrement-button');
    expect(fakeCounterService.decrement).toHaveBeenCalled();
  });

  it('resets the count', () => {
    const newCount = 456;
    setFieldValue(fixture, 'reset-input', String(newCount));
    click(fixture, 'reset-button');
    expect(fakeCounterService.reset).toHaveBeenCalledWith(newCount);
  });
});

// Using "Pick" and "keyof", we create a derived type that only contains the public members
describe('ServiceCounterComponent: unit test with minimal Service logic', () => {
  const newCount = 456;

  let component: ServiceCounterComponent;
  let fixture: ComponentFixture<ServiceCounterComponent>;

  let fakeCount$: BehaviorSubject<number>;
  let fakeCounterService: Pick<CounterService, keyof CounterService>;

  beforeEach(async () => {
    fakeCount$ = new BehaviorSubject(0);

    fakeCounterService = {
      getCount() {
        return fakeCount$;
      },
      increment() {
        fakeCount$.next(1);
      },
      decrement() {
        fakeCount$.next(-1);
      },
      reset() {
        fakeCount$.next(Number(newCount));
      },
    };
    spyOn(fakeCounterService, 'getCount').and.callThrough();
    spyOn(fakeCounterService, 'increment').and.callThrough();
    spyOn(fakeCounterService, 'decrement').and.callThrough();
    spyOn(fakeCounterService, 'reset').and.callThrough();

    await TestBed.configureTestingModule({
      declarations: [ServiceCounterComponent],
      providers: [{ provide: CounterService, useValue: fakeCounterService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the start count', () => {
    expectText(fixture, 'count', '0');
    expect(fakeCounterService.getCount).toHaveBeenCalled();
  });

  it('increments the count', () => {
    click(fixture, 'increment-button');
    fixture.detectChanges();

    expectText(fixture, 'count', '1');
    expect(fakeCounterService.increment).toHaveBeenCalled();
  });

  it('decrements the count', () => {
    click(fixture, 'decrement-button');
    fixture.detectChanges();

    expectText(fixture, 'count', '-1');
    expect(fakeCounterService.decrement).toHaveBeenCalled();
  });

  it('resets the count', () => {
    setFieldValue(fixture, 'reset-input', String(newCount));
    click(fixture, 'reset-button');
    fixture.detectChanges();

    expectText(fixture, 'count', String(newCount));
    expect(fakeCounterService.reset).toHaveBeenCalledWith(newCount);
  });

  it('does not reset if the value is not a number', () => {
    const value = 'not a number';
    setFieldValue(fixture, 'reset-input', value);
    click(fixture, 'reset-button');

    expect(fakeCounterService.reset).not.toHaveBeenCalled();
  });
});
