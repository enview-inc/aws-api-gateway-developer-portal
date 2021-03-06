// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
'use strict'

const { exec } = require('./util.js')

module.exports = async () => {
  const deployerConfig = require('./get-deployer-config.js')
  if (deployerConfig.error) throw deployerConfig.error

  const {
    stackName,
    buildAssetsBucket,
    siteAssetsBucket,
    apiAssetsBucket,
    cognitoDomainName,
    samTemplate,
    packageConfig,
    customersTableName,
    preLoginAccountsTableName,
    feedbackTableName,
    cognitoIdentityPoolName,
    // FIXME: Marketplace support is currently broken
    // marketplaceSubscriptionTopic,
    accountRegistrationMode,
    feedbackEmail,
    cognitoDomainAcmCertArn,
    customDomainName,
    customDomainNameAcmCertArn,
    useRoute53Nameservers,
    staticAssetRebuildMode,
    developmentMode,
    edgeLambdaRebuildToken,
    awsSamCliProfile,
    cognitoUserPoolID,
    cognitoUserPoolARN,
    cognitoIdentityPoolID
  } = deployerConfig

  await exec('sam', [
    'package',
    '--template-file', samTemplate,
    '--output-template-file', packageConfig,
    '--s3-bucket', buildAssetsBucket,
    ...(awsSamCliProfile ? ['--profile', awsSamCliProfile] : [])
  ])
  await exec('sam', [
    'deploy',
    '--template-file', packageConfig,
    '--stack-name', stackName,
    '--capabilities', 'CAPABILITY_NAMED_IAM',
    '--parameter-overrides',
    `StaticAssetRebuildToken=${Date.now()}`,
    ...(staticAssetRebuildMode ? [`StaticAssetRebuildMode=${staticAssetRebuildMode}`] : []),
    `DevPortalSiteS3BucketName=${siteAssetsBucket}`,
    `ArtifactsS3BucketName=${apiAssetsBucket}`,
    ...(customersTableName ? [`DevPortalCustomersTableName=${customersTableName}`] : []),
    ...(preLoginAccountsTableName ? [`DevPortalPreLoginAccountsTableName=${preLoginAccountsTableName}`] : []),
    ...(feedbackTableName ? [`DevPortalFeedbackTableName=${feedbackTableName}`] : []),
    ...(cognitoIdentityPoolName ? [`CognitoIdentityPoolName=${cognitoIdentityPoolName}`] : []),
    ...(developmentMode ? [`LocalDevelopmentMode=${developmentMode}`] : []),
    ...(cognitoDomainName ? [`CognitoDomainNameOrPrefix=${cognitoDomainName}`] : []),
    ...(cognitoUserPoolID ? [`CognitoUserPoolID=${cognitoUserPoolID}`] : []),
    ...(cognitoIdentityPoolID ? [`CognitoIdentityPoolID=${cognitoIdentityPoolID}`] : []),
    ...(cognitoUserPoolARN ? [`CognitoUserPoolARN=${cognitoUserPoolARN}`] : []),
    // FIXME: Marketplace support is currently broken
    // ...(marketplaceSubscriptionTopic ? [`MarketplaceSubscriptionTopicProductCode=${marketplaceSubscriptionTopic}`] : []),
    ...(accountRegistrationMode ? [`AccountRegistrationMode=${accountRegistrationMode}`] : []),
    ...(feedbackEmail ? [`DevPortalAdminEmail=${feedbackEmail}`] : []),
    ...(cognitoDomainAcmCertArn ? [`CognitoDomainAcmCertArn=${cognitoDomainAcmCertArn}`] : []),
    ...(customDomainName ? [`CustomDomainName=${customDomainName}`] : []),
    ...(customDomainNameAcmCertArn ? [`CustomDomainNameAcmCertArn=${customDomainNameAcmCertArn}`] : []),
    ...(useRoute53Nameservers ? [`UseRoute53Nameservers=${useRoute53Nameservers}`] : []),
    ...(edgeLambdaRebuildToken ? [`EdgeLambdaRebuildToken=${edgeLambdaRebuildToken}`] : []),
    '--s3-bucket', buildAssetsBucket,
    ...(awsSamCliProfile ? ['--profile', awsSamCliProfile] : [])
  ])
}
