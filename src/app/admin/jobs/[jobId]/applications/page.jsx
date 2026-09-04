'use client';

import React, { Suspense } from 'react';
import ApplicationsView from '../../../../../components/ApplicationsView';
import Loader from '../../../../../components/Loader';

export default function JobApplicationsPage() {
  return (
    <Suspense fallback={<Loader message="Loading applications..." />}>
      <ApplicationsView />
    </Suspense>
  );
}
