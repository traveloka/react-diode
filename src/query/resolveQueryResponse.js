import find from "lodash.find";
import DiodeQueryTypes from "./DiodeQueryTypes";
import resolveBatchQuery from "./resolveBatchQuery";

/*
  Possible Errors:
  1. Injected network layer did not properly map query type and response 
  (different type specified in query)
*/
export default function resolveQueryResponse(
  queries,
  initialQueries,
  queryResponseMap,
  options
) {
  return Object.keys(queryResponseMap).reduce((map, type) => {
    try {
      const queryResponse = queryResponseMap[type];
      const query = find(queries, { type });

      if (type === DiodeQueryTypes.BATCH) {
        // BatchQuery returns multiple response at once as single object,
        // we need to merge initial response with response generated by
        // batch query response resolution
        const batchQueryResponseMap = resolveBatchQuery(
          query.resolve(queryResponse, options),
          initialQueries,
          options
        );
        Object.assign(map, batchQueryResponseMap);
      } else {
        map[type] = query.resolve(queryResponse, query.fragment, options);
      }

      return map;
    } catch (err) {
      throw new Error(
        `Query type ${type} from network layer does not match any query types specified in Diode queries.`
      );
    }
  }, {});
}
