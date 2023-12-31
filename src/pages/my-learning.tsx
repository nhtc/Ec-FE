import React from 'react';
import Loadable from 'react-loadable';
import Layout from 'src/components/common/Layout';
import { LoadingPage } from 'src/components/loading/loadingBase';
import PrivateProvider from 'src/components/providers/PrivateProvider';

const MyCourseLoadable = Loadable({
  loader: () => import('src/sections/Pages/MyLearning'),
  loading: () => <LoadingPage isLoading={true} />,
});
const MyCourse: React.FC = () => {
  return (
    <React.Fragment>
      <PrivateProvider>
        <Layout>
          <MyCourseLoadable />
        </Layout>
      </PrivateProvider>
    </React.Fragment>
  );
};

export default MyCourse;
