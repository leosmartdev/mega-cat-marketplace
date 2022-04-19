import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  // WIP

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get category name in the route
    const categoryName = this.route.snapshot.params;
    // Call API for the list of card filtered by category
    // this.categoryService.getCategory(categoryName); OR
    this.getCategory();
  }

  getCategory(): void {
    // Endpoint of get category
  }
}
