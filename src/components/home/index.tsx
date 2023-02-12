import { Col, Spin } from 'antd';
import * as React from 'react';
import CourseService from 'src/lib/api/course';
import { Document, Homepage, Pagination } from 'src/lib/types/backend_modal';
import { StorageKeys } from 'src/lib/utils/enum';

import { AppstoreAddOutlined, Loading3QuartersOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';

import DocItem from '../document/doc-item';
import { DocCourseWrapper } from '../document/style';

export interface IHomeData {
  homeData: Homepage;
}
const antIcon = <Loading3QuartersOutlined style={{ fontSize: 40 }} spin />;

export default function HomeData(props: IHomeData) {
  const { homeData } = props;
  const [loading, setLoading] = React.useState<boolean>(false);
  const [listDoc, setListDoc] = React.useState<Pagination<Document>>();

  const getDocumentList = async (idList: string[]) => {
    const token = localStorage.getItem(StorageKeys.SESSION_KEY);
    try {
      setLoading(true);
      if (!token) {
        const docs = await CourseService.getHomeDocs({ page: 1, limit: 100 }, '', idList);
        console.log('doc', docs);
        setListDoc(docs);
      } else {
        const docs = await CourseService.getAllDocs({ page: 1, limit: 100 }, '', idList);
        console.log('doc co token', docs);
        setListDoc(docs);
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    getDocumentList(homeData?.detail?.document_id);
    console.log('homeDatat', homeData);
  }, [homeData]);
  return (
    <div
      css={css`
        .title {
          font-size: 25px;
          font-weight: 700;
          text-decoration: underline;
        }
        .anticon-appstore-add {
          font-size: 25px;
          margin: 5px;
        }
      `}
    >
      <AppstoreAddOutlined />
      <span className="title">{homeData.title}</span>
      {loading ? (
        <div style={{ height: '72px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin indicator={antIcon} />
        </div>
      ) : (
        <>
          <DocCourseWrapper>
            {listDoc?.results?.length
              ? listDoc?.results?.map((e, i) => {
                  return (
                    <Col key={i}>
                      <DocItem document={e} />
                    </Col>
                  );
                })
              : `There is no doc`}
          </DocCourseWrapper>
        </>
      )}
    </div>
  );
}
