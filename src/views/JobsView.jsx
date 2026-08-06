import React from 'react';
import JobsBoard from '../components/JobsBoard';

export default function JobsView({ user }) {
  return <JobsBoard user={user} />;
}
