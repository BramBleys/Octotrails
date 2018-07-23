import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Question } from '../../../../categories/question';

@Component({
  selector: 'app-question-type-string',
  templateUrl: './question-type-string.component.html',
  styleUrls: ['./question-type-string.component.css']
})
export class QuestionTypeStringComponent implements OnInit {
  @Input() question: Question;
  @Input() answer;
  @Output() answerChange: EventEmitter<object> = new EventEmitter<object>();

  constructor() {}

  ngOnInit() {}

  sendAnswer() {
    const value = { question_id: this.question.id, answer: this.answer };
    this.answerChange.emit(value);
  }
}
