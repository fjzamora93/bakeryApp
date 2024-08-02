# Child & Children View
No vamos a profundizar en esto de momento. Puedes consultarlo del video 128 al 132.

Child y Children view es la forma de seleccionar y modificar las propiedades y atributos de los hijos que haya dentro de un componente.

Si dentro de

```typescript
    import { Component, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
    import { ChildComponent } from './child.component';

    @Component({
    selector: 'app-parent',
    template: `
        <app-child></app-child>
        <app-child></app-child>
        <app-child></app-child>
    `
    })
    export class ParentComponent implements AfterViewInit {
        @ViewChildren(ChildComponent) childComponents: QueryList<ChildComponent>;

        ngAfterViewInit() {
            this.childComponents.forEach(childComponent => childComponent.greet());
        }
    }
```