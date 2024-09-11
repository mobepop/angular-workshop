import { ComponentFixture, TestBed } from '@angular/core/testing';
import { take, toArray } from 'rxjs/operators';

import { click, expectText, setFieldValue } from '../../spec-helpers/element.spec-helper';
import { CounterComponent } from './counter.component';

const startCount = 123;
const newCount = 456;

// define a test suite for the CounterComponent
describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  function expectCount(count: number): void {
    expectText(fixture, 'count', String(count));
  }

  // beforeEach block that configures TestBed and renders the Component
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterComponent],
    }).compileComponents(); // compileComponent() is async operation

    fixture = TestBed.createComponent(CounterComponent); // render the Component under test using createComponent
    component = fixture.componentInstance;
    component.startCount = startCount;
    component.ngOnChanges();
    fixture.detectChanges();
  });

  it('shows the start count', () => {
    expectCount(startCount);
  });

  // check if the count has incremented after the increment button was clicked
  it('increments the count', () => {
    click(fixture, 'increment-button');
    fixture.detectChanges();
    expectCount(startCount + 1);
  });

  // check if the count has decremented after the decrement button was clicked
  it('decrements the count', () => {
    click(fixture, 'decrement-button');
    fixture.detectChanges();
    expectCount(startCount - 1);
  });

  // check if the count has been reset after the reset button was clicked
  it('resets the count', () => {
    setFieldValue(fixture, 'reset-input', String(newCount));
    click(fixture, 'reset-button');
    fixture.detectChanges();
    expectCount(newCount);
  });

  // check if the count has changed after if the value is not a number
  // even if the reset button was clicked
  it('does not reset if the value is not a number', () => {
    const value = 'not a number';
    setFieldValue(fixture, 'reset-input', value);
    click(fixture, 'reset-button');
    fixture.detectChanges();
    expectCount(startCount);
  });

  it('emits countChange events', () => {
    let actualCounts: number[] | undefined;
    component.countChange.pipe(take(3), toArray()).subscribe((counts) => {
      actualCounts = counts;
    });

    click(fixture, 'increment-button');
    click(fixture, 'decrement-button');
    setFieldValue(fixture, 'reset-input', String(newCount));
    click(fixture, 'reset-button');

    expect(actualCounts).toEqual([startCount + 1, startCount, newCount]);
  });
});
