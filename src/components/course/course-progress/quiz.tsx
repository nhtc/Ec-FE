import { Collapse, Empty, Progress, Radio, RadioChangeEvent, Spin, Typography } from 'antd';
import _, { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from 'src/components/button';
import { RootState } from 'src/lib/reducers/model';
import { progressAction } from 'src/lib/reducers/progress/progressSlice';
import { AnswerChoiceEnum, Quiz, QuizResult, UserAnswersArgs } from 'src/lib/types/backend_modal';
import { antIcon } from 'src/lib/utils/animations';

import { css } from '@emotion/react';
import Skeleton from 'react-loading-skeleton';

const { Panel } = Collapse;

const { Text, Link } = Typography;

interface QuizProps {
  listQuiz: Quiz[];
  onSubmit: () => void;
  result: QuizResult | undefined;
  isDone: boolean;
  loading: boolean;
  courseId: string;
  mark: number;
}

const QuizSection: React.FC<QuizProps> = (props) => {
  const { listQuiz, onSubmit, result, loading, isDone, courseId, mark } = props;
  const answerSheet = useSelector((state: RootState) => state.progress.answerSheet);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [customResult, setCustomResult] = useState<any>([]);

  const [listAnswer, setListAnswer] = useState<string[]>(
    answerSheet && answerSheet.filter((v) => v.answer_choice !== AnswerChoiceEnum.NO_CHOICE)?.map((u) => u.quiz_id),
  );
  const [value, setValue] = useState(0);
  const dispatch = useDispatch();
  const onChange = (e: RadioChangeEvent, id: string) => {
    let choice = e.target.value;
    if (choice === 1) choice = AnswerChoiceEnum.A;
    if (choice === 2) choice = AnswerChoiceEnum.B;
    if (choice === 3) choice = AnswerChoiceEnum.C;
    if (choice === 4) choice = AnswerChoiceEnum.D;

    dispatch(progressAction.updateCheckedAnswer({ quiz_id: id, answer_choice: choice } as UserAnswersArgs));
    const idx = listAnswer.indexOf(id);
    if (idx < 0) {
      setListAnswer([...listAnswer, id]);
    }
  };
  useEffect(() => {
    const obj = {};
    const newResult = result?.quiz_answers.forEach((v) => {
      const { quiz_id, correct_answer, answer_choice } = v;
      obj[quiz_id] = {
        correct: correct_answer,
        choice: answer_choice,
      };
    });
    setCustomResult(obj);
  }, [result]);

  return (
    <div
      className="quiz_wrapper"
      css={css`
        width: 100%;
        margin-left: 7%;
        max-width: 77%;
        .ant-progress {
          position: absolute;
          right: 10px;
          top: 10px;
          max-width: 15%;
        }
        .question-list {
          min-height: 50px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin: 25px 0;
        }
        .question {
          font-weight: 600;
        }
        .done-btn {
          width: fit-content;
          background-color: #faad14 !important;
          border-color: #faad14 !important;
          font-weight: 700;
          border-radius: 10px;
          width: 150px;
          letter-spacing: 1px;
          &:hover {
            letter-spacing: 3px;
            color: #000;
          }
          &[disabled] {
            cursor: not-allowed;
          }
        }

        .ant-radio-disabled .ant-radio-inner:after {
          color: #1890ff;
          background-color: #1890ff;
        }
        .choice {
          margin-bottom: 0 !important;
        }
        .error {
          .choice {
            color: red;
            font-weight: 700;
            margin-bottom: 0 !important;
          }
          .ant-radio-inner:after {
            color: red;
            background-color: red;
            transform: scale(0.5);
            opacity: 1;
            transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
          }
        }
        .correct {
          .choice {
            color: #1890ff;
            font-weight: 700;
            margin-bottom: 0 !important;
          }
          .ant-radio-inner:after {
            color: #1890ff;
            background-color: #1890ff;
            transform: scale(0.5);
            opacity: 1;
            transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
          }
        }
        .user_choice {
          .ant-radio-inner:after {
            color: #1890ff;
            background-color: #1890ff;
            transform: scale(0.5);
            opacity: 1;
            transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
          }
        }
        .ant-progress-text {
          font-weight: 600;
        }
        .mark {
          background-color: transparent;
          & > .ant-progress-inner {
            width: 70px !important;
            height: 70px !important;
            font-size: 20px !important;
          }
        }
      `}
    >
      {loading ? (
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <QuizSkeleton />
        </div>
      ) : (
        <></>
      )}
      {!loading && isDone ? (
        <Progress
          type="circle"
          className="mark"
          percent={(mark || 0) * 10}
          format={(percent) => `${percent && parseFloat(percent.toFixed(2)) / 10}/10`}
          status="exception"
          strokeColor={{
            from: '#7b4397',
            to: ' #dc2430',
          }}
        />
      ) : (
        <></>
      )}
      {listQuiz.length ? (
        listQuiz?.map((quiz, i) => {
          return (
            <div key={i} className="question-list">
              <Text className="question">{`${i + 1}/ ${quiz.question}`}</Text>

              <Radio.Group onChange={(e) => onChange(e, quiz.id)} disabled={isDone || isSubmit}>
                <Radio
                  className={`answer ${
                    customResult
                      ? customResult[quiz.id]?.correct === AnswerChoiceEnum.A
                        ? customResult[quiz.id]?.choice === customResult[quiz.id]?.correct
                          ? 'correct'
                          : 'error'
                        : customResult[quiz.id]?.choice === AnswerChoiceEnum.A
                        ? 'user_choice'
                        : ''
                      : ''
                  } `}
                  value={1}
                >
                  <p className="choice">{quiz.A}</p>
                </Radio>
                <Radio
                  className={`answer ${
                    customResult
                      ? customResult[quiz.id]?.correct === AnswerChoiceEnum.B
                        ? customResult[quiz.id]?.choice === customResult[quiz.id]?.correct
                          ? 'correct'
                          : 'error'
                        : customResult[quiz.id]?.choice === AnswerChoiceEnum.B
                        ? 'user_choice'
                        : ''
                      : ''
                  } `}
                  value={2}
                >
                  <p className="choice">{quiz.B}</p>
                </Radio>
                <Radio
                  className={`answer ${
                    customResult
                      ? customResult[quiz.id]?.correct === AnswerChoiceEnum.C
                        ? customResult[quiz.id]?.choice === customResult[quiz.id]?.correct
                          ? 'correct'
                          : 'error'
                        : customResult[quiz.id]?.choice === AnswerChoiceEnum.C
                        ? 'user_choice'
                        : ''
                      : ''
                  } `}
                  value={3}
                >
                  <p className="choice">{quiz.C}</p>
                </Radio>
                <Radio
                  className={`answer ${
                    customResult
                      ? customResult[quiz.id]?.correct === AnswerChoiceEnum.D
                        ? customResult[quiz.id]?.choice === customResult[quiz.id]?.correct
                          ? 'correct'
                          : 'error'
                        : customResult[quiz.id]?.choice === AnswerChoiceEnum.D
                        ? 'user_choice'
                        : ''
                      : ''
                  } `}
                  value={4}
                >
                  <p className="choice">{quiz.D}</p>
                </Radio>
              </Radio.Group>
            </div>
          );
        })
      ) : (
        <Empty className="empty-data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      {!loading && !isEmpty(listQuiz) && (
        <AppButton
          className="done-btn"
          btnTextColor={'black'}
          btnStyle={'solid'}
          btnSize={'small'}
          btnWidth={'full-w'}
          disabled={!isDone ? (listAnswer.length < listQuiz.length ? true : false) : false}
          onClick={() => {
            setIsSubmit(true);
            onSubmit();
          }}
        >
          {!isDone ? 'NỘP BÀI' : 'CHỨNG CHỈ'}
        </AppButton>
      )}
    </div>
  );
};

const QuizSkeleton = () => {
  return (
    <div
      css={css`
        width: 100%;
      `}
    >
      {_.times(10).map((v) => (
        <div
          key={v}
          css={css`
            width: 100%;
            height: 100%;
            margin: 15px 0;
            .ans {
              margin-top: 10px;
              display: flex;
              justify-content: space-around;
              gap: 10px;
              .option {
                width: 25%;
                display: flex;
                gap: 5px;
                & > span {
                  width: 100%;
                }
                .circle {
                  width: fit-content;
                }
              }
            }
          `}
        >
          <Skeleton height={15} />
          <div className="ans">
            <div className="option">
              <Skeleton circle width={15} height={15} containerClassName="circle" />
              <Skeleton height={15} />
            </div>
            <div className="option">
              <Skeleton circle width={15} height={15} containerClassName="circle" />
              <Skeleton height={15} />
            </div>{' '}
            <div className="option">
              <Skeleton circle width={15} height={15} containerClassName="circle" />
              <Skeleton height={15} />
            </div>{' '}
            <div className="option">
              <Skeleton circle width={15} height={15} containerClassName="circle" />
              <Skeleton height={15} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizSection;
