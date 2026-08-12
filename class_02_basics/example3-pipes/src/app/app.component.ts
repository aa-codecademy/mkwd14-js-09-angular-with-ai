import { CurrencyPipe, DatePipe, DecimalPipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TruncatePipe } from './truncate.pipe';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, UpperCasePipe, SlicePipe, TruncatePipe],
  template: `
    <h2>Built-in Pipes</h2>
    <table border="1" cellPadding="10">
      <tr>
        <th>Pipe</th>
        <th>Input</th>
        <th>Result</th>
      </tr>
      <tr>
        <td>currency</td>
        <td>{{ price }}</td>
        <td>{{ price | currency: 'EUR' : 'symbol' : '1.2-2' }}</td>
      </tr>
      <tr>
        <td>date (short)</td>
        <td>{{ today }}</td>
        <td>{{ today | date: 'shortDate' }}</td>
      </tr>
      <tr>
        <td>date (long)</td>
        <td>{{ today }}</td>
        <td>{{ today | date: 'fullDate' }}</td>
      </tr>
      <tr>
        <td>date (custom)</td>
        <td>{{ today }}</td>
        <td>{{ today | date: 'dd.MM.yyyy' }}</td>
      </tr>
      <tr>
        <td>number</td>
        <td>{{ number }}</td>
        <td>{{ number | number: '1.0-2' }}</td>
      </tr>
      <tr>
        <td>text</td>
        <td>{{ text }}</td>
        <td>{{ text | uppercase }}</td>
      </tr>
      <tr>
        <td>slice</td>
        <td>{{ text }}</td>
        <td>{{ text | slice: 0 : 15 }}...</td>
      </tr>
    </table>

    <h2>Custom Truncate Pipe</h2>
    @for (product of products; track product.id) {
      <div>
        <strong>{{ product.name }}</strong>
        <p>Default (80 chars): {{ product.description | truncate }}</p>
        <p>Custom (50 chars): {{ product.description | truncate: 50 }}</p>
        <p>Custom (40 chars): {{ product.description | truncate: 40 : ' [read more]' }}</p>
      </div>
    }
  `,
})
export class App {
  price = 1250.5;
  today = new Date();
  number = 8367128312.3123;
  text = 'Angular Piper are very useful';
  products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      description:
        'Premium sound quality with active noise cancellation. Perfect for commuting or working from home with up to 30 hours battery life and foldable design.',
    },
    {
      id: 2,
      name: 'Laptop Stand',
      description:
        'Adjustable aluminum stand for laptops up to 17 inches. Improves posture and airflow. Folds flat for easy transport in any bag.',
    },
    {
      id: 3,
      name: 'Microphone',
      description: 'Very nice mic.',
    },
  ];
}
