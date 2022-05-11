import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { RewardsService } from 'app/core/rewards/rewards.service';
import { S3Structure } from 'app/core/rewards/rewards';

@Component({
  selector: 'app-rewards-explorer',
  templateUrl: './rewards-explorer.component.html',
  styleUrls: ['./rewards-explorer.component.scss']
})
export class RewardsExplorerComponent implements OnInit {
  @Input() files: S3Structure;

  treeControl = new NestedTreeControl<S3Structure>((node) => node.members);
  dataSource = new MatTreeNestedDataSource<S3Structure>();
  constructor(private rewardsService: RewardsService) {}

  hasChild = (_: number, node: S3Structure) => !!node.members && node.members.length > 0;

  ngOnInit(): void {
    console.log('initializing component', this.files);

    this.dataSource.data = [this.files];
  }

  getFile(node: S3Structure) {
    if (node.type === 'file' && node.link) {
      this.rewardsService.getResource(node.link).subscribe((res) => {
        const filename = res.headers.get('content-disposition')?.split(';')[1].split('="')[1].slice(0, -1);

        const blob: Blob = res.body;
        const anchorTag = document.createElement('a');
        anchorTag.download = filename;
        anchorTag.href = window.URL.createObjectURL(blob);
        anchorTag.click();
      });
    }
  }
}
