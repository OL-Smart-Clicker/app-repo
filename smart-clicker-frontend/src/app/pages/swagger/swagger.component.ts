import { Component, OnInit } from '@angular/core';

declare const SwaggerUIBundle: any;

@Component({
    selector: 'app-swagger-ui',
    templateUrl: './swagger.component.html',
})
export class SwaggerComponent implements OnInit {

    ngOnInit(): void {
        const ui = SwaggerUIBundle({
            dom_id: '#swagger-ui',
            layout: 'BaseLayout',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            url: `/api/api-docs`,
            docExpansion: 'none',
            operationsSorter: 'alpha'
        });
    }
}