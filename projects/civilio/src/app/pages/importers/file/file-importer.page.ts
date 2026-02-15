import { Component, output } from '@angular/core';
import { Importer } from '..';

@Component({
	selector: 'cv-file',
	imports: [],
	templateUrl: './file-importer.page.html',
	styleUrl: './file-importer.page.scss',
})
export class FilePage implements Importer {
	finished = output<string>();

}
