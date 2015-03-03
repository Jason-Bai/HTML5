var dbUtil = {
	// 数据库池
	dbPools: {},
	/**
	 * 构建动态参数字符串
	 * args:
	 *	size(Number): 标识的个数
	 */
	createDynamics: function (size) {
		var dynamics = [];
		for(var i = 0; i < size; i++) {
			dynamics.push('?');
		}
		return dynamics.join(',');
	},
	createBatchDataStr: function (arr) {
		var r = [];
		for(var i = 0, max = arr.length; i < max; i++) {
			r.push('(' + arr[i].join(',') + ')');
		}
		return r.join(',');
	},
	/**
	 * 创建WebSQL数据库
	 * args:
	 *	dbName(String): 数据库名称
	 *	verName(String): 版本名称
	 *	descName(String): 描述信息
	 *	size(Number): 数据库大小，单位B
	 */
	createDb: function (dbName, verName, descName, size, callback) {
		this.dbPools['' + dbName + ''] = openDatabase(dbName, verName, descName, size, callback);
	},
	/**
	 * 创建WebSQL数据库表
	 * args: 
	 * 	dbName(String): 数据库名称
	 *	tableName(String): 数据库表名
	 *	properties[Array]: 属性名称数组
	 */
	createTable: function (dbName, tableName, properties) {
		var createSql = 'CREATE TABLE IF NOT EXISTS {table} ({properties})';
		createSql = createSql.replace('{table}', tableName);
		createSql = createSql.replace('{properties}', properties.join(','));
		this.dbPools['' + dbName + ''].transaction(function (tx) {
			tx.executeSql(createSql);
		});
	},
	/**
	 * 插入一条数据
	 * args:
	 *	dbName(String): 数据库名称
	 *	tableName(String): 数据库表名称
	 *	properties(Array): 属性名称
	 *	data(Array): 待插入的数据
	 */
	insertData: function (dbName, tableName, properties, data) {
		var insertSql = 'INSERT INTO {table} ({properties}) VALUES({data})';
		insertSql = insertSql.replace('{table}', tableName);
		insertSql = insertSql.replace('{properties}', properties.join(','));
		var dynamicsStr = this.createDynamics(properties.length);
		insertSql = insertSql.replace('{data}', dynamicsStr);
		//insertSql = insertSql.replace('{data}', data.join(','));
		this.dbPools['' + dbName + ''].transaction(function (tx) {
			tx.executeSql(insertSql, data);
			//tx.executeSql(insertSql);
		});
	},
	/**
	 * 查询
	 * args:
	 *	dbName(String): 数据库名称
	 *	tableName(String): 数据库表名称
	 * 	sql(String): 查询语句
	 *	paras(Array): 参数
	 *	callback(Function): 回调函数
	 */
	query: function (dbName, tableName, sql, paras, callback) {
		this.dbPools['' + dbName + ''].transaction(function (tx) {
			tx.executeSql(sql, paras, function (tx, results){
				callback && callback(results);
			}, null);
		});
	},
	/**
	 * 清空表数据
	 * args:
	 * 	dbName(String): 数据库名称
	 * 	tableName(String): 数据库表名称
	 */
	removeAll: function (dbName, tableName) {
		var removeSql = 'DELETE FROM {table}';
		removeSql = removeSql.replace('{table}', tableName);
		this.dbPools['' + dbName + ''].transaction(function (tx) {
			tx.executeSql(removeSql);
		});
	},
	// 暂时不好使
	destroyTable: function (dbName, tableName) {
		var destroySql = 'drop table {table}';
		destroySql.replace('{table}', tableName);
		this.dbPools['' + dbName + ''].transaction(function (tx) {
			tx.executeSql(destroySql);
		});
	},
	// 暂时不好使
	batchInsert: function (dbName, tableName, properties, data) {
		var insertSql = 'INSERT INTO {table} ({properties}) VALUES{data}';
		insertSql = insertSql.replace('{table}', tableName);
		insertSql = insertSql.replace('{properties}', properties);
		var dataStr = this.createBatchDataStr(data);
		insertSql = insertSql.replace('{data}', dataStr);
		this.dbPools['' + dbName + ''].transaction(function (tx) {
			tx.executeSql(insertSql);
		});
	}
};